package com.apex.chat.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    public void saveUser(User user){
        user.setStatus(Status.ONLINE);
        userRepository.save(user);
    };
    public void disconnectUser(User user){
        var storedUser= userRepository.findById(user.getUsername())
                .orElse(null);
        if(storedUser!=null){
            storedUser.setStatus(Status.OFFLINE);
            userRepository.save(storedUser);
        }

    }

    public List<User> findConnectedUsers(){
        //return userRepository.findAllByStatus(Status.ONLINE);
        return userRepository.findAll();
    }
}
