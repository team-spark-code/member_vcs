package com.example.demo.service;

import com.example.demo.domain.Member;
import com.example.demo.dto.MemberForm;
import com.example.demo.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public boolean isUsernameExists(String username) {
        return memberRepository.findByUsername(username).isPresent();
    }

    public boolean isEmailExists(String email) {
        return memberRepository.findByEmail(email).isPresent();
    }

    @Transactional
    public Long join(Member member) {
        if (member.getPassword() == null || !member.getPassword().equals(member.getPasswordConfirm())) {
            throw new IllegalStateException("비밀번호가 일치하지 않습니다.");
        }
        if (isUsernameExists(member.getUsername())) {
            throw new IllegalStateException("이미 존재하는 아이디입니다.");
        }
        if (isEmailExists(member.getEmail())) {
            throw new IllegalStateException("이미 존재하는 이메일입니다.");
        }
        member.setPassword(passwordEncoder.encode(member.getPassword()));
        memberRepository.save(member);
        return member.getId();
    }

    public List<Member> findMembers() {
        return memberRepository.findAll();
    }

    public Page<Member> findMembers(Pageable pageable) {
        return memberRepository.findAll(pageable);
    }

    public Member findByUsername(String username) {
        return memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
    }

    @Transactional
    public void updateProfile(String username, MemberForm form) {
        Member member = findByUsername(username);
        member.setEmail(form.getEmail());
        member.setName(form.getName());
        member.setZipcode(form.getZipcode());
        member.setAddress(form.getAddress());
        member.setDetailAddress(form.getDetailAddress());

        String phoneNumber = form.getPhone1() + form.getPhone2() + form.getPhone3();
        member.setPhoneNumber(phoneNumber);

        if (form.getPassword() != null && !form.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(form.getPassword()));
        }
        memberRepository.save(member);
    }
}
