package com.roomsketch.service;

import org.springframework.stereotype.Service;

@Service
public class TemplateService {

    public String getTemplateLayout(String templateId) {
        if ("garden-apartment".equalsIgnoreCase(templateId)) {
            return getGardenApartmentLayout();
        } else if ("modern-studio".equalsIgnoreCase(templateId)) {
            return getModernStudioLayout();
        }
        return getBlankLayout();
    }

    public String getBlankLayout() {
        return """
        {
          "version": 1,
          "unit": "METERS",
          "gridSize": 20,
          "rooms": [
            {
              "id": "room-initial-1",
              "name": "Main Room",
              "x": 200,
              "y": 150,
              "width": 500,
              "height": 400,
              "wallThickness": 12,
              "wallColor": "#292524",
              "floorColor": "#FBFBFA",
              "floorMaterial": "hardwood_oak"
            }
          ],
          "furniture": [],
          "doorsWindows": [
            {
              "id": "door-initial-1",
              "roomId": "room-initial-1",
              "type": "DOOR",
              "name": "Entrance Door",
              "x": 420,
              "y": 550,
              "width": 80,
              "height": 12,
              "rotation": 0,
              "wall": "SOUTH",
              "swing": "INSIDE_LEFT"
            }
          ]
        }
        """;
    }

    public String getGardenApartmentLayout() {
        // Matches the user reference design: 85.3 m² Total footprint, 5 rooms, curated architectural furniture
        return """
        {
          "version": 1,
          "unit": "METERS",
          "gridSize": 20,
          "rooms": [
            {
              "id": "room-living-dining",
              "name": "Living & dining",
              "x": 100,
              "y": 80,
              "width": 380,
              "height": 300,
              "wallThickness": 12,
              "wallColor": "#292524",
              "floorColor": "#EBDCCB",
              "floorMaterial": "warm_oak"
            },
            {
              "id": "room-bedroom",
              "name": "Bedroom",
              "x": 480,
              "y": 80,
              "width": 240,
              "height": 260,
              "wallThickness": 12,
              "wallColor": "#292524",
              "floorColor": "#E2D3BE",
              "floorMaterial": "warm_oak"
            },
            {
              "id": "room-kitchen",
              "name": "Kitchen",
              "x": 100,
              "y": 380,
              "width": 190,
              "height": 180,
              "wallThickness": 12,
              "wallColor": "#292524",
              "floorColor": "#D9E3DF",
              "floorMaterial": "sage_tile"
            },
            {
              "id": "room-entry",
              "name": "Entry",
              "x": 290,
              "y": 380,
              "width": 190,
              "height": 180,
              "wallThickness": 12,
              "wallColor": "#292524",
              "floorColor": "#EDE8DE",
              "floorMaterial": "ceramic_sand"
            },
            {
              "id": "room-bathroom",
              "name": "Bathroom",
              "x": 480,
              "y": 340,
              "width": 240,
              "height": 220,
              "wallThickness": 12,
              "wallColor": "#292524",
              "floorColor": "#DCE9EA",
              "floorMaterial": "light_blue_tile"
            }
          ],
          "furniture": [
            {
              "id": "furn-sofa",
              "roomId": "room-living-dining",
              "name": "Linen sofa",
              "category": "LIVING_ROOM",
              "type": "sofa_linen",
              "x": 130,
              "y": 140,
              "width": 60,
              "height": 150,
              "rotation": 0,
              "color": "#C5BCAB",
              "material": "linen",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-rug",
              "roomId": "room-living-dining",
              "name": "Woven rug",
              "category": "DECORATION",
              "type": "rug_woven",
              "x": 180,
              "y": 140,
              "width": 130,
              "height": 150,
              "rotation": 0,
              "color": "#E5DEC9",
              "material": "wool",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 1
            },
            {
              "id": "furn-coffee-table",
              "roomId": "room-living-dining",
              "name": "Coffee table",
              "category": "LIVING_ROOM",
              "type": "coffee_table",
              "x": 220,
              "y": 180,
              "width": 40,
              "height": 70,
              "rotation": 0,
              "color": "#A67A53",
              "material": "wood",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-lounge-chair",
              "roomId": "room-living-dining",
              "name": "Lounge chair",
              "category": "LIVING_ROOM",
              "type": "chair_lounge",
              "x": 280,
              "y": 120,
              "width": 55,
              "height": 55,
              "rotation": -25,
              "color": "#B38260",
              "material": "leather",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-dining-table",
              "roomId": "room-living-dining",
              "name": "Dining table",
              "category": "DINING_ROOM",
              "type": "table_dining_4",
              "x": 340,
              "y": 210,
              "width": 65,
              "height": 105,
              "rotation": 0,
              "color": "#A07855",
              "material": "hardwood",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-plant-living-1",
              "roomId": "room-living-dining",
              "name": "Indoor plant",
              "category": "DECORATION",
              "type": "plant_potted",
              "x": 120,
              "y": 95,
              "width": 35,
              "height": 35,
              "rotation": 0,
              "color": "#4A6B53",
              "material": "ceramic",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 3
            },
            {
              "id": "furn-plant-living-2",
              "roomId": "room-living-dining",
              "name": "Indoor plant",
              "category": "DECORATION",
              "type": "plant_potted",
              "x": 420,
              "y": 95,
              "width": 35,
              "height": 35,
              "rotation": 0,
              "color": "#4A6B53",
              "material": "ceramic",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 3
            },
            {
              "id": "furn-bed-queen",
              "roomId": "room-bedroom",
              "name": "Queen bed",
              "category": "BEDROOM",
              "type": "bed_queen",
              "x": 540,
              "y": 110,
              "width": 95,
              "height": 130,
              "rotation": 0,
              "color": "#8EA69B",
              "material": "fabric",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-bedside-left",
              "roomId": "room-bedroom",
              "name": "Bedside table",
              "category": "BEDROOM",
              "type": "nightstand",
              "x": 505,
              "y": 115,
              "width": 30,
              "height": 30,
              "rotation": 0,
              "color": "#A98462",
              "material": "wood",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-bedside-right",
              "roomId": "room-bedroom",
              "name": "Bedside table",
              "category": "BEDROOM",
              "type": "nightstand",
              "x": 640,
              "y": 115,
              "width": 30,
              "height": 30,
              "rotation": 0,
              "color": "#A98462",
              "material": "wood",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-bedroom-closet",
              "roomId": "room-bedroom",
              "name": "Wardrobe",
              "category": "STORAGE",
              "type": "wardrobe_double",
              "x": 540,
              "y": 280,
              "width": 100,
              "height": 40,
              "rotation": 0,
              "color": "#A07E60",
              "material": "wood",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-kitchen-counter",
              "roomId": "room-kitchen",
              "name": "Kitchen counter & sink",
              "category": "KITCHEN",
              "type": "counter_sink",
              "x": 115,
              "y": 420,
              "width": 45,
              "height": 120,
              "rotation": 0,
              "color": "#637D71",
              "material": "composite",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-kitchen-island",
              "roomId": "room-kitchen",
              "name": "Prep table",
              "category": "KITCHEN",
              "type": "kitchen_prep",
              "x": 210,
              "y": 500,
              "width": 60,
              "height": 40,
              "rotation": 0,
              "color": "#A07855",
              "material": "wood",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-bathtub",
              "roomId": "room-bathroom",
              "name": "Bathtub",
              "category": "BATHROOM",
              "type": "bathtub",
              "x": 645,
              "y": 420,
              "width": 55,
              "height": 110,
              "rotation": 0,
              "color": "#E5EEF0",
              "material": "acrylic",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-toilet",
              "roomId": "room-bathroom",
              "name": "Toilet",
              "category": "BATHROOM",
              "type": "toilet",
              "x": 510,
              "y": 510,
              "width": 30,
              "height": 45,
              "rotation": 0,
              "color": "#FFFFFF",
              "material": "porcelain",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-vanity",
              "roomId": "room-bathroom",
              "name": "Washbasin",
              "category": "BATHROOM",
              "type": "washbasin",
              "x": 520,
              "y": 360,
              "width": 45,
              "height": 35,
              "rotation": 0,
              "color": "#CFDCDE",
              "material": "ceramic",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            }
          ],
          "doorsWindows": [
            {
              "id": "door-entry-main",
              "roomId": "room-entry",
              "type": "DOOR",
              "name": "Main Entrance Door",
              "x": 380,
              "y": 560,
              "width": 75,
              "height": 12,
              "rotation": 0,
              "wall": "SOUTH",
              "swing": "INSIDE_LEFT"
            },
            {
              "id": "door-living-kitchen",
              "roomId": "room-kitchen",
              "type": "DOOR",
              "name": "Kitchen Door",
              "x": 190,
              "y": 380,
              "width": 65,
              "height": 12,
              "rotation": 0,
              "wall": "NORTH",
              "swing": "INSIDE_LEFT"
            },
            {
              "id": "door-hall-bed",
              "roomId": "room-bedroom",
              "type": "DOOR",
              "name": "Bedroom Door",
              "x": 480,
              "y": 300,
              "width": 65,
              "height": 12,
              "rotation": 90,
              "wall": "WEST",
              "swing": "INSIDE_LEFT"
            },
            {
              "id": "door-hall-bath",
              "roomId": "room-bathroom",
              "type": "DOOR",
              "name": "Bathroom Door",
              "x": 480,
              "y": 420,
              "width": 65,
              "height": 12,
              "rotation": 90,
              "wall": "WEST",
              "swing": "INSIDE_LEFT"
            },
            {
              "id": "win-living-north",
              "roomId": "room-living-dining",
              "type": "WINDOW",
              "name": "Living Window North",
              "x": 260,
              "y": 80,
              "width": 110,
              "height": 12,
              "rotation": 0,
              "wall": "NORTH"
            },
            {
              "id": "win-bed-north",
              "roomId": "room-bedroom",
              "type": "WINDOW",
              "name": "Bedroom Window",
              "x": 570,
              "y": 80,
              "width": 80,
              "height": 12,
              "rotation": 0,
              "wall": "NORTH"
            }
          ]
        }
        """;
    }

    public String getModernStudioLayout() {
        return """
        {
          "version": 1,
          "unit": "METERS",
          "gridSize": 20,
          "rooms": [
            {
              "id": "room-studio-main",
              "name": "Studio Living & Bed",
              "x": 150,
              "y": 100,
              "width": 420,
              "height": 320,
              "wallThickness": 12,
              "wallColor": "#292524",
              "floorColor": "#EBDCCB",
              "floorMaterial": "light_oak"
            },
            {
              "id": "room-studio-bath",
              "name": "Ensuite Bathroom",
              "x": 150,
              "y": 420,
              "width": 180,
              "height": 160,
              "wallThickness": 12,
              "wallColor": "#292524",
              "floorColor": "#DCE9EA",
              "floorMaterial": "tile"
            }
          ],
          "furniture": [
            {
              "id": "furn-studio-bed",
              "roomId": "room-studio-main",
              "name": "Queen bed",
              "category": "BEDROOM",
              "type": "bed_queen",
              "x": 450,
              "y": 140,
              "width": 95,
              "height": 130,
              "rotation": 0,
              "color": "#8EA69B",
              "material": "fabric",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            },
            {
              "id": "furn-studio-sofa",
              "roomId": "room-studio-main",
              "name": "2-Seater Sofa",
              "category": "LIVING_ROOM",
              "type": "sofa_linen",
              "x": 200,
              "y": 150,
              "width": 55,
              "height": 110,
              "rotation": 0,
              "color": "#C5BCAB",
              "material": "linen",
              "isLocked": false,
              "isVisible": true,
              "zIndex": 2
            }
          ],
          "doorsWindows": [
            {
              "id": "door-studio-main",
              "roomId": "room-studio-main",
              "type": "DOOR",
              "name": "Studio Entrance",
              "x": 420,
              "y": 420,
              "width": 75,
              "height": 12,
              "rotation": 0,
              "wall": "SOUTH",
              "swing": "INSIDE_LEFT"
            }
          ]
        }
        """;
    }
}
