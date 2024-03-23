package com.apex.chat.chatroom;

import lombok.*;
import org.apache.coyote.http11.filters.SavedRequestInputFilter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document
public class ChatRoom {
    private String id;
    private String chatId;
    private String senderId;
    private String recipientId;

}
