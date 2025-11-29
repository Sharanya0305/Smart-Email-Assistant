package com.email.writer.app;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*") // Allow all origins during development
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;

    public EmailGeneratorController(EmailGeneratorService emailGeneratorService) {
        this.emailGeneratorService = emailGeneratorService;
    }

    @PostMapping("/generate")
    public ResponseEntity<List<String>> generateEmail(@Valid @RequestBody EmailRequest emailRequest) {
        List<String> replies = emailGeneratorService.generateEmailReplyOptions(emailRequest);
        return ResponseEntity.ok(replies);
    }
}