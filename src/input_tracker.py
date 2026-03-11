import pynput
from pynput import keyboard, mouse
import sqlite3
import os
import threading
import time
from datetime import datetime

# Setup DB path relative to this file
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'monitor.db')

class InputTracker:
    def __init__(self, session_id=1):
        self.session_id = session_id
        self.hotkeys = {
            'copy': [keyboard.Key.ctrl_l, keyboard.KeyCode.from_char('c')],
            'paste': [keyboard.Key.ctrl_l, keyboard.KeyCode.from_char('v')],
            'cut': [keyboard.Key.ctrl_l, keyboard.KeyCode.from_char('x')],
            'undo': [keyboard.Key.ctrl_l, keyboard.KeyCode.from_char('z')],
            'save': [keyboard.Key.ctrl_l, keyboard.KeyCode.from_char('s')],
            'select_all': [keyboard.Key.ctrl_l, keyboard.KeyCode.from_char('a')],
            'find': [keyboard.Key.ctrl_l, keyboard.KeyCode.from_char('f')],
            'new_tab': [keyboard.Key.ctrl_l, keyboard.KeyCode.from_char('t')],
            'close_tab': [keyboard.Key.ctrl_l, keyboard.KeyCode.from_char('w')],
            'app_switch': [keyboard.Key.alt_l, keyboard.Key.tab]
        }
        self.current_keys = set()
        self.running = False
        self.keystroke_batch = []
        self.mouse_event_batch = []
        self.last_activity = time.time()
        self.lock = threading.Lock()

    def _log_to_db(self):
        while self.running:
            time.sleep(5)  # Batch writes every 5 seconds
            with self.lock:
                if not self.keystroke_batch and not self.mouse_event_batch:
                    continue
                
                try:
                    conn = sqlite3.connect(DB_PATH)
                    cursor = conn.cursor()
                    
                    if self.keystroke_batch:
                        cursor.executemany('''
                            INSERT INTO keystrokes (session_id, key_name, is_hotkey, hotkey_combo, active_app)
                            VALUES (?, ?, ?, ?, ?)
                        ''', self.keystroke_batch)
                        self.keystroke_batch = []
                        
                    if self.mouse_event_batch:
                        cursor.executemany('''
                            INSERT INTO mouse_events (session_id, event_type, x_pos, y_pos, active_app)
                            VALUES (?, ?, ?, ?, ?)
                        ''', self.mouse_event_batch)
                        self.mouse_event_batch = []
                        
                    conn.commit()
                    conn.close()
                except Exception as e:
                    print(f"Error logging to DB: {e}")

    def on_press(self, key):
        self.current_keys.add(key)
        key_name = str(key).replace("'", "")
        
        # Check for hotkeys
        is_hotkey = False
        hotkey_combo = None
        
        # Simple hotkey detection logic for Ctrl combos
        if keyboard.Key.ctrl_l in self.current_keys or keyboard.Key.ctrl_r in self.current_keys:
            # Check common keys
            for name, combo in self.hotkeys.items():
                if all(k in self.current_keys for k in combo):
                    is_hotkey = True
                    hotkey_combo = name
                    break

        with self.lock:
            self.last_activity = time.time()
            # We don't have active_app yet, placeholder for now
            self.keystroke_batch.append((self.session_id, key_name, is_hotkey, hotkey_combo, "Unknown"))

    def on_release(self, key):
        if key in self.current_keys:
            self.current_keys.remove(key)

    def on_click(self, x, y, button, pressed):
        if pressed:
            event_type = f"click_{str(button).replace('Button.', '')}"
            with self.lock:
                self.last_activity = time.time()
                self.mouse_event_batch.append((self.session_id, event_type, int(x), int(y), "Unknown"))

    def on_scroll(self, x, y, dx, dy):
        event_type = "scroll_up" if dy > 0 else "scroll_down"
        with self.lock:
            self.last_activity = time.time()
            self.mouse_event_batch.append((self.session_id, event_type, int(x), int(y), "Unknown"))

    def start(self):
        self.running = True
        self.db_thread = threading.Thread(target=self._log_to_db, daemon=True)
        self.db_thread.start()
        
        self.key_listener = keyboard.Listener(on_press=self.on_press, on_release=self.on_release)
        self.mouse_listener = mouse.Listener(on_click=self.on_click, on_scroll=self.on_scroll)
        
        self.key_listener.start()
        self.mouse_listener.start()
        
        print("Input tracking started...")

    def stop(self):
        self.running = False
        self.key_listener.stop()
        self.mouse_listener.stop()
        if hasattr(self, 'db_thread'):
            self.db_thread.join()
        print("Input tracking stopped.")

if __name__ == "__main__":
    tracker = InputTracker()
    tracker.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        tracker.stop()
