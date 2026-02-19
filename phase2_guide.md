# Phase 2: CAD Design & Rapid Prototyping

This phase introduces students to computer-aided design (CAD) and rapid prototyping techniques using 3D printing and laser cutting.

## Learning Objectives

By the end of Phase 2, students will be able to:
- Create parametric 3D models using Python
- Generate STL files for 3D printing
- Produce G-code for laser cutting
- Understand CAD design principles
- Apply rapid prototyping in robotics projects

## Software and Tools

### Required Software
- Python 3.8+ (for CAD script execution)
- 3D printing software (Cura, PrusaSlicer, or similar)
- Laser cutting software (compatible with G-code)
- STL file viewer (optional: FreeCAD, Meshlab)

### Hardware Requirements
The academy utilizes the following specific hardware for rapid prototyping:

#### 3D Printers
- **Bambu Lab X1 Carbon**
  - **Type:** CoreXY FDM
  - **Build Volume:** 256 x 256 x 256 mm
  - **Features:** AI failure detection, Lidar leveling, Multi-Material System (AMS) for 4+ colors.
  - **Best For:** Advanced engineering materials (ABS, Carbon Fiber) and high-speed prototyping.
- **Bambu Lab A1**
  - **Type:** Cartesian "Bed Slinger" FDM
  - **Build Volume:** 256 x 256 x 256 mm
  - **Features:** Active Flow Rate Compensation, AMS Lite for multi-color printing.
  - **Best For:** PLA/PETG parts, multi-color visual models, and high-speed drafting.
- **Prusa Research i3 MK3S+**
  - **Type:** Cartesian FDM
  - **Build Volume:** 250 x 210 x 210 mm
  - **Features:** Direct drive extruder, mesh bed leveling, open-source hardware.
  - **Best For:** Learning printer mechanics, maintenance, and reliable daily printing.

#### Laser Cutters
- **Epilog Laser Fusion Maker**
  - **Type:** CO2 Laser Cutter/Engraver
  - **Work Area:** 24" x 12" (610 x 305 mm)
  - **Power:** 30W or 40W CO2 Laser
  - **Features:** IRIS™ Camera Positioning System for precise alignment.
  - **Materials:** Wood, Acrylic, Cardboard, Leather (Cutting & Engraving); Anodized Aluminum, Glass (Engraving only).

- Computer for design and slicing

## CAD Design Fundamentals

### Parametric Design
Parametric design means creating models where dimensions and features are defined by parameters that can be easily changed.

**Advantages:**
- Easy to modify designs
- Consistent scaling
- Automated generation of variations
- Integration with programming

### 3D Model Formats
- **STL (STereoLithography)**: Most common format for 3D printing
- **OBJ**: Alternative format with material support
- **STEP/IGES**: Professional CAD formats (more complex)

### Coordinate Systems
- **Right-hand rule**: X (right), Y (forward), Z (up)
- **Origin**: (0,0,0) is typically the center or corner of the model
- **Units**: Millimeters for most 3D printing applications

## 3D Printing Basics

### 3D Printing Technologies Overview

There are two main 3D printing technologies used in education and prototyping: **FDM (Fused Deposition Modeling)** and **SLA (Stereolithography)**. Each has distinct advantages and use cases.

#### FDM vs SLA Comparison

| Feature | FDM | SLA |
|---------|-----|-----|
| **Process** | Extrudes melted thermoplastic filament | Uses UV laser to cure liquid resin |
| **Materials** | PLA, ABS, PETG, Nylon, Composites | Photosensitive resins |
| **Build Size** | Large (up to 300mm+) | Smaller (up to 200mm) |
| **Resolution** | 100-300 microns | 25-100 microns |
| **Surface Finish** | Layer lines visible | Smooth, injection-molded quality |
| **Strength** | High mechanical strength | Brittle, engineering resins available |
| **Cost** | Low material/printer cost | Higher material cost |
| **Speed** | Faster for large parts | Slower, more precise |
| **Post-processing** | Minimal | UV curing, support removal, washing |
| **Best for** | Functional parts, prototyping, education | Detailed models, jewelry, medical devices |

#### When to Choose FDM
- **Education and prototyping** (most common for beginners)
- **Functional mechanical parts** requiring strength
- **Large objects** that need to be lightweight
- **Cost-effective production** of multiple parts
- **Composite materials** for enhanced properties

#### When to Choose SLA
- **High-detail prototypes** with smooth surfaces
- **Presentation models** and concept verification
- **Small precision parts** (jewelry, dental, medical)
- **Complex geometries** with fine features
- **Transparent or colored** parts

### FDM (Fused Deposition Modeling) Process
1. **Design**: Create 3D model
2. **Slice**: Convert to G-code with slicing software
3. **Print**: Extrude melted plastic layer by layer

#### Printer Mechanics: CoreXY vs. Bed Slinger
Understanding the kinematics of our printers helps in orienting parts and choosing the right machine.

- **Bed Slinger (Cartesian)**: The print bed moves along the Y-axis (back and forth).
  - **Lab Printers:** Bambu Lab A1, Prusa i3 MK3S+
  - **Considerations:** The moving bed creates inertia. Tall, thin parts may wobble or detach if printed at high speeds.

- **CoreXY**: The bed moves only in Z (vertical), while the head moves X and Y.
  - **Lab Printers:** Bambu Lab X1 Carbon
  - **Considerations:** The stationary bed provides high stability. This allows for significantly faster printing speeds and is safer for tall, delicate prints.

### Key Parameters
- **Layer Height**: 0.1-0.3mm (finer = smoother but slower)
- **Infill**: 10-30% for most functional parts
- **Wall Thickness**: 2-4 shells for strength
- **Supports**: Required for overhangs >45°

### Common FDM Materials
- **PLA**: Easy to print, biodegradable, good for prototyping
- **PETG**: Durable, temperature resistant, good for functional parts
- **ABS**: Strong, heat resistant, requires heated bed
- **Nylon**: Flexible, wear-resistant, good for moving parts
- **TPU**: Rubber-like, flexible for gaskets and grips
- **Carbon Fiber**: High strength-to-weight ratio

### SLA Materials (Resins)
- **Standard Resin**: General purpose, good for detailed models
- **Tough Resin**: Impact-resistant, engineering applications
- **Flexible Resin**: Rubber-like, for flexible prototypes
- **Castable Resin**: Burns out cleanly for jewelry casting
- **Dental Resin**: Biocompatible, medical applications
- **Clear Resin**: Transparent parts, optical applications

### Print Settings by Material

#### FDM Settings
| Material | Bed Temp (°C) | Nozzle Temp (°C) | Print Speed (mm/s) | Supports Needed |
|----------|---------------|------------------|-------------------|-----------------|
| PLA      | 50-60        | 190-220         | 50-80            | Minimal        |
| PETG     | 70-80        | 220-250         | 40-60            | Moderate       |
| ABS      | 90-110       | 220-250         | 40-60            | Extensive      |
| Nylon    | 80-100       | 240-260         | 30-50            | Moderate       |

#### SLA Settings
| Material | Layer Height | Exposure Time | Best For |
|----------|--------------|---------------|----------|
| Standard | 25-100μm    | 6-10s        | Prototypes, models |
| Tough    | 50-100μm    | 8-12s        | Functional parts |
| Flexible | 50-100μm    | 10-15s       | Gaskets, grips |
| Clear    | 25-50μm     | 8-12s        | Optics, displays |

## SLA Printing Workflow

### 1. Design Phase
```bash
# Generate STL model (same as FDM)
python3 phase2/cad_design.py
```

### 2. Orientation and Supports
1. Import STL into SLA slicing software (ChiTuBox, Lychee, etc.)
2. Orient model for optimal strength and surface finish
3. Auto-generate supports for overhangs
4. Ensure model fits within build volume

### 3. Slicing Phase
1. Set layer height (25-100μm depending on detail needed)
2. Configure exposure times for base, normal, and support layers
3. Set lift speeds and wait times between layers
4. Generate sliced file (.ctb or .cbddlp format)

### 4. Printing Phase
1. Fill resin tank and ensure clean build platform
2. Load sliced file into printer
3. Start print job (may take several hours)
4. Monitor first few layers for adhesion issues

### 5. Post-Processing
1. Remove printed part from build platform
2. Remove supports with flush cutters or pliers
3. Wash part in isopropyl alcohol (IPA) to remove uncured resin
4. UV cure for final hardness (optional for some resins)
5. Sand or polish for final finish

### SLA Safety Notes
- **Resin Handling**: Wear gloves, work in ventilated area
- **UV Light**: Avoid direct exposure to uncured resin or curing light
- **Cleanup**: Dispose of resin waste properly
- **Ventilation**: SLA printers should be in well-ventilated spaces

## Laser Cutting Basics

### Process Overview
Laser cutting uses a focused laser beam to vaporize material, creating precise cuts.

### Materials
- **Wood**: Plywood, MDF (3-6mm thickness)
- **Acrylic**: Cast and extruded (3-10mm)
- **Cardboard**: For prototyping
- **Paper**: For templates and patterns

### G-code for Laser Cutting
- **G0**: Rapid movement (laser off)
- **G1**: Linear cutting (laser on)
- **M3**: Laser on (spindle clockwise)
- **M5**: Laser off (spindle stop)
- **S###**: Laser power setting

## CAD Design Script (`cad_design.py`)

The provided script demonstrates parametric CAD generation using pure Python.

### STLWriter Class

**Purpose:** Generate STL files for 3D printing

**Key Methods:**
```python
stl = STLWriter('model.stl')  # Create STL writer
stl.add_triangle(v1, v2, v3)   # Add triangle with vertices
stl.write()                    # Save to file
```

**Triangle Format:**
- Vertices defined as (x, y, z) tuples
- Normal vector calculated automatically
- Counter-clockwise winding for correct orientation

### 3D Model Generation

#### Rover Chassis (`create_rover_chassis()`)
Creates a rectangular box chassis for robotic vehicles.

**Parameters:**
- `width`: Chassis width (default: 12mm)
- `height`: Chassis height (default: 6mm)
- `length`: Chassis length (default: 18mm)

**Features:**
- Solid rectangular structure
- Mounting points for components
- Lightweight design with internal space

#### Sensor Mount (`create_sensor_mount()`)
Creates a cylindrical mount for sensors or cameras.

**Parameters:**
- `radius`: Cylinder radius (default: 3mm)
- `height`: Cylinder height (default: 4mm)

**Features:**
- Cylindrical body for rotation
- Mounting holes for screws
- Smooth surface for sensor attachment

### Laser Cutting G-code Generation

#### G-code Structure
```
; Header comments
G21 ; Set units to millimeters
G90 ; Absolute positioning
M3 S255 ; Laser on at full power
G0 X0 Y0 ; Move to start position
G1 Z-1 F100 ; Lower to cutting depth
; Cutting paths...
G0 Z5 ; Raise to safe height
M5 ; Laser off
G0 X0 Y0 ; Return to origin
M30 ; End program
```

#### Shape Generation
- **Square**: Simple rectangular cuts
- **Circle**: Approximated with G2/G3 arc commands
- **Triangle**: Linear cuts between vertices

## Examples and Exercises

### Exercise 1: Custom Chassis Design
```python
# Modify chassis dimensions
create_rover_chassis(width=15, height=8, length=20)
```

**Tasks:**
- Change dimensions and observe STL file
- Add mounting holes
- Create different chassis shapes

### Exercise 2: Sensor Array
```python
# Create multiple sensor mounts
for i in range(3):
    create_sensor_mount(radius=2+i*0.5, height=3+i)
```

**Tasks:**
- Arrange mounts in a line
- Create different sizes for various sensors
- Add connecting structures

### Exercise 3: Laser Cut Patterns
```python
# Generate custom cutting patterns
generate_gcode_for_laser_cutting("square", 20)
generate_gcode_for_laser_cutting("triangle", 15)
```

**Tasks:**
- Create custom shapes (hexagon, star)
- Add engraving patterns
- Design interlocking parts

## 3D Printing Workflow

### 1. Design Phase
```bash
# Generate STL model
python3 phase2/cad_design.py
```

### 2. Slicing Phase
1. Open STL in slicing software (Cura, PrusaSlicer)
2. Select material and quality settings
3. Add supports if needed
4. Generate G-code

### 3. Printing Phase
1. Load filament matching material type
2. Level build plate
3. Start print job
4. Monitor first few layers

### 4. Post-Processing
- Remove supports
- Sand rough surfaces
- Test fit with other components

## Laser Cutting Workflow

### 1. Design Phase
```bash
# Generate G-code
python3 phase2/cad_design.py
```

### 2. Material Preparation
- Select appropriate material thickness
- Ensure material is flat and secure
- Set correct focus distance

### 3. Cutting Phase
1. Load G-code into laser software
2. Set power and speed parameters
3. Position material correctly
4. Execute cut

### 4. Finishing
- Remove cut pieces
- Clean edges if needed
- Test assembly fit

## Troubleshooting

### SLA Printing Issues

1. **Failed Resin Adhesion**
   - Ensure build platform is clean and properly coated
   - Check resin level and quality
   - Verify platform leveling
   - Increase initial exposure time

2. **Incomplete Curing**
   - Increase layer exposure time
   - Check UV light intensity
   - Ensure proper resin-to-platform distance (typically 0.05-0.1mm)
   - Verify resin hasn't expired

3. **Support Structure Failures**
   - Increase support density
   - Use thicker support bases
   - Optimize support angles (45° or less)
   - Check for proper support placement

4. **Warping or Deformation**
   - Increase support structures
   - Reduce layer thickness
   - Optimize part orientation
   - Allow longer post-curing time

5. **Surface Imperfections**
   - Increase exposure time for bottom layers
   - Use higher quality resin
   - Clean build platform thoroughly
   - Check for resin contamination

### Safety Considerations for SLA

- **UV Light Exposure**: Always wear UV-protective eyewear when operating SLA printers
- **Resin Handling**: Use nitrile gloves and work in well-ventilated areas; avoid skin contact
- **Post-Curing**: Use dedicated UV curing chambers; never look directly at UV light sources
- **Waste Disposal**: Follow local regulations for resin waste disposal; never pour down drains

### Laser Cutting Issues

1. **Incomplete Cuts**
   - Increase laser power
   - Decrease cutting speed
   - Check focus alignment

2. **Burning/Excessive Heat**
   - Reduce laser power
   - Increase cutting speed
   - Use air assist if available

3. **Inaccurate Cuts**
   - Check calibration
   - Verify G-code coordinates
   - Ensure material is flat

### CAD Script Issues

1. **Invalid STL Files**
   - Check triangle winding order
   - Verify vertex coordinates
   - Ensure closed mesh

2. **G-code Errors**
   - Validate coordinate ranges
   - Check laser power settings
   - Verify movement commands

## Advanced Topics

### Mesh Optimization
- Reduce triangle count for faster printing
- Ensure manifold geometry (no holes)
- Optimize for print orientation

### Multi-part Assemblies
- Design interlocking features
- Include alignment pins
- Plan assembly sequence

### Material Selection
- Consider strength requirements
- Think about temperature resistance
- Factor in cost and availability

## Integration with Robotics

### Mounting Considerations
- Design for sensor alignment
- Include cable management
- Plan for component access

### Tolerance Design
- Account for 3D printing tolerances (±0.1-0.2mm)
- Design for press-fit assemblies
- Include adjustment features

### Iterative Design
- Print, test, modify, repeat
- Start with simple prototypes
- Refine based on testing results

## Resources

- [3D Printing Basics](https://www.simplify3d.com/support/print-quality-troubleshooting/)
- [FDM vs SLA Comparison](https://www.creality.com/blog/fdm-vs-sla-the-differences-to-be-clearly-explained)
- [SLA Printing Guide](https://formlabs.com/blog/ultimate-guide-to-stereolithography-sla-3d-printing/)
- [G-code Reference](https://marlinfw.org/meta/gcode/)
- [STL File Format](https://en.wikipedia.org/wiki/STL_(file_format))
- [FreeCAD Documentation](https://wiki.freecadweb.org/)
- [Cura Slicing Software](https://ultimaker.com/software/ultimaker-cura)
- [PrusaSlicer](https://www.prusa3d.com/prusaslicer/)

## Safety Guidelines

### 3D Printing Safety
- **Ventilation**: Print in well-ventilated area (some filaments emit fumes)
- **Temperature**: Hot surfaces can cause burns
- **Moving Parts**: Keep hands clear of printer mechanisms
- **Power**: Unplug when not in use

### Laser Cutting Safety
- **Eye Protection**: Always wear laser safety goggles
- **Fire Prevention**: Keep fire extinguisher nearby
- **Material Safety**: Some materials produce toxic fumes when cut
- **Supervision**: Never leave laser unattended

### General Lab Safety
- **Tool Usage**: Use tools properly and safely
- **Cleanup**: Keep workspace organized
- **Emergency**: Know location of first aid kit and emergency exits