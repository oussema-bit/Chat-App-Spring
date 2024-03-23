package com.apex.chat.chat;

import com.apex.chat.chatroom.ChatRoomService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomService chatRoomService;

    public ChatMessage save(ChatMessage message){
        var chatId=chatRoomService.getChatRoomId(
                message.getSenderId(),
                message.getRecipientId(),
                true)
                .orElseThrow();//Throw any exception !!
        message.setChatId(chatId);
        chatMessageRepository.save(message);
        return message;
    }

    public List<ChatMessage> findChatMessages(
            String senderId,
            String recipientId){
        var chatId=chatRoomService.getChatRoomId(
                senderId,
                recipientId,
                false
        );
        return chatId.map(chatMessageRepository::findByChatId)
                .orElse(new ArrayList<>());
    }
}
