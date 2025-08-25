package com.example.demo.controller;

import com.example.demo.config.CustomAuditorAware;
import com.example.demo.domain.Member;
import com.example.demo.dto.MemberForm;
import com.example.demo.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;


    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/signup")
    public String signupForm(Model model) {
        model.addAttribute("memberForm", new MemberForm());
        return "signup";
    }

    @PostMapping("/signup")
    public String signup(MemberForm form, Model model) {
        if (!form.getPassword().equals(form.getPasswordConfirm())) {
            model.addAttribute("memberForm", form);
            model.addAttribute("errorMessage", "비밀번호가 일치하지 않습니다.");
            return "signup";
        }
        try {
            CustomAuditorAware.setAuditor(form.getUsername());
            Member member = new Member();
            member.setUsername(form.getUsername());
            member.setName(form.getName());
            member.setPassword(form.getPassword());
            member.setPasswordConfirm(form.getPasswordConfirm()); // 서비스 계층 검증을 위해 추가
            member.setEmail(form.getEmail());

            // 전화번호 필드를 하나로 합쳐서 설정
            String phoneNumber = form.getPhone1() + form.getPhone2() + form.getPhone3();
            member.setPhoneNumber(phoneNumber);

            member.setZipcode(form.getZipcode());
            member.setAddress(form.getAddress());
            member.setDetailAddress(form.getDetailAddress());
            memberService.join(member);
        } catch (IllegalStateException e) {
            model.addAttribute("memberForm", form);
            model.addAttribute("errorMessage", e.getMessage());
            return "signup";
        } finally {
            CustomAuditorAware.clear(); // ThreadLocal 클리어
        }
        return "redirect:/";
    }

    @GetMapping("/api/check-username")
    @ResponseBody
    public String checkUsername(@RequestParam String username) {
        boolean exists = memberService.isUsernameExists(username);
        return exists ? "duplicate" : "ok";
    }

    @GetMapping("/api/check-email")
    @ResponseBody
    public String checkEmail(@RequestParam String email) {
        boolean exists = memberService.isEmailExists(email);
        return exists ? "duplicate" : "ok";
    }

    @GetMapping("/members")
    public String list(@RequestParam(value = "page", defaultValue = "0") int page, Model model) {
        int pageSize = 5;
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Member> memberPage = memberService.findMembers(pageable);
        model.addAttribute("members", memberPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", memberPage.getTotalPages());
        model.addAttribute("hasPrev", memberPage.hasPrevious());
        model.addAttribute("hasNext", memberPage.hasNext());
        return "members";
    }

    @GetMapping("/profile")
    public String profileForm(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Member member = memberService.findByUsername(username);
        MemberForm form = new MemberForm();
        form.setUsername(member.getUsername());
        form.setName(member.getName());
        form.setEmail(member.getEmail());
        if (member.getPhoneNumber() != null && member.getPhoneNumber().length() == 11) {
            form.setPhone1(member.getPhoneNumber().substring(0, 3));
            form.setPhone2(member.getPhoneNumber().substring(3, 7));
            form.setPhone3(member.getPhoneNumber().substring(7));
        }
        form.setZipcode(member.getZipcode());
        form.setAddress(member.getAddress());
        form.setDetailAddress(member.getDetailAddress());
        model.addAttribute("memberForm", form);
        return "profile";
    }

    @PostMapping("/profile")
    public String updateProfile(MemberForm form, Model model) {
        if (!form.getPassword().isEmpty() && !form.getPassword().equals(form.getPasswordConfirm())) {
            model.addAttribute("memberForm", form);
            model.addAttribute("errorMessage", "비밀번호가 일치하지 않습니다.");
            return "profile";
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        memberService.updateProfile(username, form);
        return "redirect:/";
    }
}
