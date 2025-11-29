package com.email.writer.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${GEMINI_MODEL}")
    private String geminiModel;

    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    private String getGeminiUrl() {
        return "https://generativelanguage.googleapis.com/v1/models/" + geminiModel + ":generateContent";
    }

    public List<String> generateEmailReplyOptions(EmailRequest emailRequest) {
        String prompt = buildPrompt(emailRequest);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] {
                                Map.of("text", prompt)
                        })
                }
        );

        try {
            String response = webClient.post()
                    .uri(getGeminiUrl() + "?key=" + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            System.out.println("Gemini raw response: " + response);
            return extractTextReplies(response);

        } catch (WebClientResponseException e) {
            System.out.println("Gemini error status: " + e.getStatusCode());
            System.out.println("Gemini error body: " + e.getResponseBodyAsString());
            return getMockReplies();
        } catch (Exception e) {
            e.printStackTrace();
            return getMockReplies();
        }
    }

    private List<String> extractTextReplies(String response) {
        List<String> replies = new ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            String rawText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            // Strip Markdown code block if present
            rawText = rawText.trim();
            if (rawText.startsWith("```")) {
                int firstNewline = rawText.indexOf("\n");
                rawText = rawText.substring(firstNewline + 1); // skip ```json or ```
                int lastBacktick = rawText.lastIndexOf("```");
                if (lastBacktick != -1) {
                    rawText = rawText.substring(0, lastBacktick).trim();
                }
            }

            JsonNode replyArray = mapper.readTree(rawText);
            if (replyArray.isArray()) {
                for (JsonNode node : replyArray) {
                    replies.add(node.asText());
                }
            } else {
                replies.add(rawText);
            }

        } catch (Exception e) {
            replies.add("Error parsing Gemini response: " + e.getMessage());
        }

        return replies;
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate three separate email reply options for the following message. ");
        prompt.append("Each reply should be in a different tone: Simple, Inquiring, and Casual. ");
        prompt.append("Return the replies as a JSON array of strings. Each string should be a complete email reply including greeting, body, and closing. Use natural email formatting like 'Hi', 'Thank you', 'Best regards', etc. ");
        prompt.append("Do not include subject lines or titles. ");
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Prioritize a ").append(emailRequest.getTone()).append(" tone. ");
        }
        prompt.append("\nOriginal email:\n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }

    private List<String> getMockReplies() {
        return List.of(
                "Good morning to you too! Hope you have a great day.",
                "Hey, morning! How’s your day going so far?",
                "Mornin’! Right back at ya. Hope it’s a good one."
        );
    }
}