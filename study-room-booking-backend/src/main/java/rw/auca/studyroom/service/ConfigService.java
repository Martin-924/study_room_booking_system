package rw.auca.studyroom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rw.auca.studyroom.model.SystemConfig;
import rw.auca.studyroom.repository.SystemConfigRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ConfigService {

    @Autowired
    private SystemConfigRepository configRepository;

    public String get(String key, String defaultValue) {
        return configRepository.findById(key)
            .map(SystemConfig::getConfigValue)
            .orElse(defaultValue);
    }

    public int getInt(String key, int defaultValue) {
        try {
            String val = get(key, null);
            return val != null ? Integer.parseInt(val) : defaultValue;
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public Map<String, Object> getAll() {
        List<SystemConfig> all = configRepository.findAll();
        Map<String, Object> result = new HashMap<>();
        for (SystemConfig c : all) {
            result.put(c.getConfigKey(), c.getConfigValue());
        }
        // 保证默认值存在
        putIfAbsent(result, "max_bookings_per_day", "3");
        putIfAbsent(result, "check_in_window_minutes", "30");
        putIfAbsent(result, "violation_blacklist_threshold", "3");
        putIfAbsent(result, "no_show_grace_minutes", "30");
        putIfAbsent(result, "checkout_grace_minutes", "30");
        return result;
    }

    public void set(String key, String value) {
        SystemConfig config = configRepository.findById(key)
            .orElse(new SystemConfig(key, value));
        config.setConfigValue(value);
        configRepository.save(config);
    }

    public void setAll(Map<String, String> body) {
        for (Map.Entry<String, String> entry : body.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isBlank()) {
                set(entry.getKey(), entry.getValue().trim());
            }
        }
    }

    private void putIfAbsent(Map<String, Object> map, String key, String defaultValue) {
        if (!map.containsKey(key)) {
            map.put(key, defaultValue);
        }
    }
}
