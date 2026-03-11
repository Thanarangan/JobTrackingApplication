package com.thana.jobtrackingapplicationbe.service;


import com.thana.jobtrackingapplicationbe.dto.auth.AuthResponse;
import com.thana.jobtrackingapplicationbe.dto.auth.LoginRequest;
import com.thana.jobtrackingapplicationbe.dto.auth.RegisterRequest;
import com.thana.jobtrackingapplicationbe.exception.ApiException;
import com.thana.jobtrackingapplicationbe.model.AppUser;
import com.thana.jobtrackingapplicationbe.repo.UserRepo;
import com.thana.jobtrackingapplicationbe.security.JwtService;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepo userRepo,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public Long register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername())) throw new ApiException("Username already exists");
        if (userRepo.existsByEmail(req.getEmail())) throw new ApiException("Email already exists");

        AppUser u = new AppUser();
        u.setUsername(req.getUsername());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setAge(req.getAge());

        return userRepo.save(u).getId();
    }

    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new ApiException("Invalid username/password");
        }

        AppUser u = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new ApiException("User not found"));

        String token = jwtService.generateToken(u.getUsername());
        return new AuthResponse(token, u.getId(), u.getUsername());
    }
}