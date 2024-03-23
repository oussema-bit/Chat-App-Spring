package com.apex.chat.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate template;

    @MessageMapping("/chat")
    public void processMessage(
            @Payload ChatMessage chatMessage
    ){
        ChatMessage message= chatMessageService.save(chatMessage);
        template.convertAndSendToUser(
                message.getRecipientId(),
                "/queue/messages",
                ChatNotification.builder()
                        .chatId(message.getId())
                        .content(message.getContent())
                        .recipientId(message.getRecipientId())
                        .senderId(message.getSenderId())
                        .build()
        );
    }
    @GetMapping("/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessage>> findMessages(
            @PathVariable("senderId")String senderId,
            @PathVariable("recipientId")String recipientId
    ){
        return ResponseEntity.ok(chatMessageService.findChatMessages(senderId,recipientId));

    }


}
