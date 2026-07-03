package rw.auca.studyroom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rw.auca.studyroom.model.UserAccount;
import rw.auca.studyroom.model.UserRole;
import rw.auca.studyroom.repository.UserAccountRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserAccountService {

    public static final String DEFAULT_PASSWORD = "123456";

    @Autowired
    private UserAccountRepository userAccountRepository;

    public List<UserAccount> getAllUsers() {
        return userAccountRepository.findAll();
    }

    public Optional<UserAccount> getById(UUID id) {
        return userAccountRepository.findById(id);
    }

    public Map<String, Object> login(String username, String password) {
        UserAccount user = userAccountRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("账号或密码错误"));
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new RuntimeException("账号已停用，请联系管理员");
        }
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("账号或密码错误");
        }
        return toPublicMap(user);
    }

    public UserAccount createUser(UserAccount user) {
        if (userAccountRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("账号已存在");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            user.setPassword(DEFAULT_PASSWORD);
        }
        if (user.getRole() == null) {
            user.setRole(UserRole.STUDENT);
        }
        if (user.getRealName() == null || user.getRealName().isBlank()) {
            user.setRealName(user.getUsername());
        }
        return userAccountRepository.save(user);
    }

    public UserAccount updateUser(UUID id, UserAccount userDetails) {
        UserAccount user = userAccountRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("账号不存在"));
        user.setRealName(userDetails.getRealName());
        user.setRole(userDetails.getRole() == null ? user.getRole() : userDetails.getRole());
        user.setStudentNo(userDetails.getStudentNo());
        user.setClassName(userDetails.getClassName());
        user.setPhone(userDetails.getPhone());
        user.setEnabled(userDetails.getEnabled() == null ? user.getEnabled() : userDetails.getEnabled());
        user.setBlacklisted(userDetails.getBlacklisted() == null ? user.getBlacklisted() : userDetails.getBlacklisted());
        user.setViolationCount(userDetails.getViolationCount() == null ? user.getViolationCount() : userDetails.getViolationCount());
        return userAccountRepository.save(user);
    }

    public boolean deleteUser(UUID id) {
        if (!userAccountRepository.existsById(id)) {
            return false;
        }
        userAccountRepository.deleteById(id);
        return true;
    }

    public UserAccount resetPassword(UUID id) {
        UserAccount user = userAccountRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("账号不存在"));
        user.setPassword(DEFAULT_PASSWORD);
        return userAccountRepository.save(user);
    }

    public void changePassword(UUID userId, String oldPassword, String newPassword) {
        UserAccount user = userAccountRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("账号不存在"));
        if (!user.getPassword().equals(oldPassword)) {
            throw new RuntimeException("原密码不正确");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("新密码至少 6 位");
        }
        user.setPassword(newPassword);
        userAccountRepository.save(user);
    }

    public UserAccount setBlacklist(UUID id, boolean blacklisted) {
        UserAccount user = userAccountRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("账号不存在"));
        user.setBlacklisted(blacklisted);
        if (!blacklisted) {
            user.setViolationCount(0);
        }
        return userAccountRepository.save(user);
    }

    public Map<String, Object> registerUser(Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String realName = request.get("realName");
        String studentNo = request.get("studentNo");
        String className = request.get("className");
        String phone = request.get("phone");

        if (username == null || username.isBlank()) {
            throw new RuntimeException("用户名不能为空");
        }
        if (password == null || password.length() < 6) {
            throw new RuntimeException("密码至少 6 位");
        }
        if (userAccountRepository.existsByUsername(username)) {
            throw new RuntimeException("用户名已存在");
        }
        if (realName == null || realName.isBlank()) {
            throw new RuntimeException("姓名不能为空");
        }
        if (studentNo == null || studentNo.isBlank()) {
            throw new RuntimeException("学号不能为空");
        }
        if (className == null || className.isBlank()) {
            throw new RuntimeException("班级不能为空");
        }
        if (phone == null || phone.isBlank()) {
            throw new RuntimeException("手机号不能为空");
        }

        UserAccount user = new UserAccount();
        user.setUsername(username.trim());
        user.setPassword(password);
        user.setRealName(realName.trim());
        user.setRole(UserRole.STUDENT);
        user.setEnabled(true);
        user.setBlacklisted(false);
        user.setViolationCount(0);
        user.setStudentNo(studentNo.trim());
        user.setClassName(className.trim());
        user.setPhone(phone.trim());

        UserAccount saved = userAccountRepository.save(user);
        return toPublicMap(saved);
    }

    public Map<String, Object> toPublicMap(UserAccount user) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", user.getId());
        result.put("username", user.getUsername());
        result.put("realName", user.getRealName());
        result.put("role", user.getRole());
        result.put("studentNo", user.getStudentNo());
        result.put("className", user.getClassName());
        result.put("phone", user.getPhone());
        result.put("enabled", user.getEnabled());
        result.put("blacklisted", user.getBlacklisted());
        result.put("violationCount", user.getViolationCount());
        return result;
    }
}
