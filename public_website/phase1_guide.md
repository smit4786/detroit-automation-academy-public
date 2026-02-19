# Phase 1: Python Fundamentals & Microcontrollers

This phase introduces students to Python programming and basic microcontroller interaction using the Raspberry Pi.

## Learning Objectives

By the end of Phase 1, students will be able to:
- Write basic Python scripts
- Control GPIO pins on a Raspberry Pi
- Read input from sensors and buttons
- Implement basic control loops
- Debug hardware-software interactions

## Hardware Setup

### Required Components
- Raspberry Pi 4 or newer
- Breadboard
- Jumper wires (male-to-male, male-to-female)
- LEDs (various colors)
- 220Ω resistors (current-limiting for LEDs)
- Push buttons
- Optional: Temperature sensor (DS18B20), ultrasonic distance sensor

### Hardware References

For detailed Raspberry Pi pinout and specifications:
- **Raspberry Pi GPIO Pinout Diagram:** [https://pinout.xyz](https://pinout.xyz) — Interactive pin reference
- **Official Raspberry Pi Documentation:** [https://www.raspberrypi.com/documentation/computers/raspberry-pi.html](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)
- **RPi.GPIO Documentation:** [https://pypi.org/project/RPi.GPIO/](https://pypi.org/project/RPi.GPIO/)

**BCM vs. BOARD Pin Numbering:**
- **BCM (Broadcom)**: Uses GPIO numbering (e.g., GPIO 17) — preferred for code
- **BOARD**: Uses physical pin numbers (e.g., Pin 11) — useful for hardware wiring
- Our Phase 1 examples use **BCM mode** (set with `GPIO.setmode(GPIO.BCM)`)

---

### Why LEDs Need Current-Limiting Resistors

LEDs are current-controlled devices with non-linear I-V (current-voltage) characteristics. Unlike resistors, small changes in forward voltage can cause large changes in forward current. Without current-limiting resistors, LEDs can:

1. **Draw excessive current** - Leading to immediate failure or reduced lifespan
2. **Experience thermal runaway** - As LEDs heat up, their forward voltage decreases, causing more current to flow, which generates more heat in a dangerous feedback loop
3. **Show inconsistent brightness** - Due to manufacturing variations in forward voltage

### How to Calculate Resistor Values

Use Ohm's Law: **R = (V_supply - V_forward) / I_desired**

Where:
- **V_supply** = Supply voltage (3.3V for Raspberry Pi GPIO)
- **V_forward** = LED forward voltage (typically 2.0-3.3V for standard LEDs)
- **I_desired** = Desired current (typically 10-20mA for standard LEDs)

**Example Calculation:**
- Raspberry Pi GPIO: 3.3V
- Red LED V_forward: 2.1V
- Desired current: 15mA (0.015A)

R = (3.3V - 2.1V) / 0.015A = 1.2V / 0.015A = 80Ω

**Common Resistor Values for Raspberry Pi:**
- Red/Green LEDs: 220Ω (safe for most applications)
- Blue/White LEDs: 100-150Ω (lower forward voltage)
- High-brightness LEDs: Check datasheet for exact specifications

### Circuit Protection

Always include current-limiting resistors in series with LEDs:
```
GPIO Pin → Resistor → LED Anode (+) → LED Cathode (-) → GND
```

**Never connect LEDs directly to GPIO pins** - this can damage both the LED and the Raspberry Pi!

### GPIO Pin Layout
```
Raspberry Pi GPIO Layout:
3V3  (1) (2)  5V
GPIO2 (3) (4)  5V
GPIO3 (5) (6)  GND
GPIO4 (7) (8)  GPIO14
GND   (9) (10) GPIO15
GPIO17(11)(12) GPIO18
GPIO27(13)(14) GND
GPIO22(15)(16) GPIO23
3V3  (17)(18) GPIO24
GPIO10(19)(20) GND
GPIO9 (21)(22) GPIO25
GPIO11(23)(24) GPIO8
GND  (25)(26) GPIO7
GPIO0 (27)(28) GPIO1
GPIO5 (29)(30) GND
GPIO6 (31)(32) GPIO12
GPIO13(33)(34) GND
GPIO19(35)(36) GPIO16
GPIO26(37)(38) GPIO20
GND  (39)(40) GPIO21
```

## Examples

### LED Blinking (`led_blink.py`)

This example demonstrates basic GPIO output control and proper LED circuit design.

**Circuit Setup:**
```
Raspberry Pi GPIO 17 ──► 220Ω Resistor ──► LED Anode (+) │
                                                       │
                                                       ▼
                                                     LED Cathode (-) ──► GND
```

**Breadboard Layout:**
```
GPIO 17 ──► [220Ω] ──► LED+ │
                              │
                              ▼
                            LED- ──► GND Pin
```

**Safety Notes:**
- **Always use a current-limiting resistor** (220Ω is safe for most LEDs with Raspberry Pi)
- **Never connect LED directly to GPIO** - this will damage the Raspberry Pi
- **Check LED polarity** - anode (+) connects to resistor, cathode (-) to GND
- **Verify resistor value** - too low = LED burnout, too high = dim LED

**Code Explanation:**
```python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)  # Use BCM pin numbering
GPIO.setup(17, GPIO.OUT)  # Set pin 17 as output

GPIO.output(17, GPIO.HIGH)  # Turn LED on (3.3V through resistor)
time.sleep(1)  # Wait 1 second
GPIO.output(17, GPIO.LOW)   # Turn LED off (0V)

GPIO.cleanup()  # Clean up GPIO settings
```

### Button Press Detection (`button_press.py`)

This example shows how to read digital input from a button.

**Circuit Setup:**
- Connect one button pin to GPIO pin 18
- Connect the other button pin to GND
- Enable internal pull-up resistor in software

**Code Explanation:**
```python
GPIO.setup(18, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.add_event_detect(18, GPIO.FALLING, callback=button_callback)
```

## Exercises

1. **Traffic Light Controller**
   - Control 3 LEDs (red, yellow, green) to simulate a traffic light
   - Implement timing for each state

2. **Binary Counter**
   - Use multiple LEDs to display binary numbers
   - Increment counter with button press

3. **Temperature Monitor**
   - Read temperature from DS18B20 sensor
   - Display temperature on console
   - Turn on LED if temperature exceeds threshold

4. **Distance Sensor**
   - Use ultrasonic sensor to measure distance
   - Display distance readings
   - Sound alarm (LED) when object is too close

## Troubleshooting

### Common Issues

1. **Permission Denied Error**
   - GPIO access requires root privileges
   - Run with `sudo python3 script.py`

2. **Channel Already in Use**
   - Previous program didn't clean up GPIO
   - Always call `GPIO.cleanup()` at the end

3. **LED Not Lighting**
   - Check circuit connections (LED polarity: anode to resistor, cathode to GND)
   - Verify correct pin numbers and GPIO mode (BCM vs BOARD)
   - Check resistor value (220Ω is safe; too high = dim, too low = dangerous)
   - Test LED with multimeter (should show ~2-3V forward voltage)
   - Verify GPIO pin is set to OUTPUT mode

4. **LED Too Dim or Too Bright**
   - Calculate proper resistor: R = (3.3V - V_forward) / I_desired
   - Typical values: Red/Green=220Ω, Blue/White=100-150Ω
   - Check LED datasheet for exact forward voltage and current specs

5. **LED Burns Out**
   - Missing or incorrect resistor value
   - LED connected directly to GPIO (no resistor)
   - Exceeded maximum current rating

6. **Button Not Responding**
   - Check button wiring
   - Verify pull-up/down resistor configuration
   - Check for switch bounce (use bouncetime parameter)

### Debugging Tips

- Use `GPIO.input(pin)` to read current pin state
- Add print statements to verify code execution
- Use multimeter to test circuit continuity and voltages
- Check Raspberry Pi pinout diagram carefully
- Test components individually before combining circuits

### Safety Guidelines

- **Always use current-limiting resistors with LEDs**
- **Never exceed GPIO current limits** (16mA per pin, 50mA total)
- **Double-check polarity** before powering circuits
- **Use breadboard for prototyping** - avoid soldering mistakes
- **Power off Raspberry Pi** when connecting/disconnecting circuits

## Resources

- [Raspberry Pi GPIO Documentation](https://www.raspberrypi.org/documentation/usage/gpio/)
- [Python GPIO Library](https://sourceforge.net/p/raspberry-gpio-python/wiki/Home/)
- [LED Current Limiting Resistors Guide](https://www.waveformlighting.com/pcb-designs/when-and-why-do-leds-need-current-limiting-resistors)
- [Adafruit GPIO Tutorial](https://learn.adafruit.com/adafruits-raspberry-pi-lesson-4-gpio-setup)