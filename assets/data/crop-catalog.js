"use strict";

window.CROP_CATALOG = [
  {
    "id": "crop-endyam",
    "name": "末芋",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 2880,
    "regrowMinutes": 960,
    "harvests": 1,
    "yieldPerHarvestMin": 1,
    "yieldPerHarvestMax": 1,
    "unitPrice": 40,
    "processingOptions": []
  },
  {
    "id": "crop-thunder-grass",
    "name": "霹雳草",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 5760,
    "regrowMinutes": 1920,
    "harvests": 1,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 35,
    "processingOptions": []
  },
  {
    "id": "crop-paddy",
    "name": "水稻",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 7200,
    "regrowMinutes": 1800,
    "harvests": 1,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 75,
    "processingOptions": [
      {
        "id": "rice",
        "name": "大米",
        "finalUnitPrice": 100,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 30,
        "processingMinutesPerInputMax": 30,
        "stages": [
          {
            "id": "rice",
            "method": "研磨机",
            "name": "大米",
            "durationMinutes": 30,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      },
      {
        "id": "rice>rice_wine",
        "name": "米酒",
        "finalUnitPrice": 300,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 7230,
        "processingMinutesPerInputMax": 7230,
        "stages": [
          {
            "id": "rice",
            "method": "研磨机",
            "name": "大米",
            "durationMinutes": 30,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          },
          {
            "id": "rice_wine",
            "method": "酿酒桶",
            "name": "米酒",
            "durationMinutes": 7200,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      },
      {
        "id": "rice>rice_wine>aged_rice_wine",
        "name": "陈酿米酒",
        "finalUnitPrice": 600,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 21630,
        "processingMinutesPerInputMax": 21630,
        "stages": [
          {
            "id": "rice",
            "method": "研磨机",
            "name": "大米",
            "durationMinutes": 30,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          },
          {
            "id": "rice_wine",
            "method": "酿酒桶",
            "name": "米酒",
            "durationMinutes": 7200,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          },
          {
            "id": "aged_rice_wine",
            "method": "窖藏架",
            "name": "陈酿米酒",
            "durationMinutes": 14400,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-chinese-cabbage",
    "name": "白菜",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 8640,
    "regrowMinutes": 2160,
    "harvests": 1,
    "yieldPerHarvestMin": 1,
    "yieldPerHarvestMax": 1,
    "unitPrice": 130,
    "processingOptions": [
      {
        "id": "pickled_vegetables",
        "name": "泡菜",
        "finalUnitPrice": 245,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 4320,
        "processingMinutesPerInputMax": 4320,
        "stages": [
          {
            "id": "pickled_vegetables",
            "method": "腌制罐",
            "name": "泡菜",
            "durationMinutes": 4320,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-scallion",
    "name": "葱",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 8640,
    "regrowMinutes": 2160,
    "harvests": 1,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 65,
    "processingOptions": []
  },
  {
    "id": "crop-pumpkin",
    "name": "南瓜",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 12960,
    "regrowMinutes": 2160,
    "harvests": 1,
    "yieldPerHarvestMin": 1,
    "yieldPerHarvestMax": 1,
    "unitPrice": 360,
    "processingOptions": []
  },
  {
    "id": "crop-turnip",
    "name": "萝卜",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 10080,
    "regrowMinutes": 3360,
    "harvests": 1,
    "yieldPerHarvestMin": 1,
    "yieldPerHarvestMax": 1,
    "unitPrice": 240,
    "processingOptions": [
      {
        "id": "turnip_kimchi",
        "name": "萝卜泡菜",
        "finalUnitPrice": 410,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 4320,
        "processingMinutesPerInputMax": 4320,
        "stages": [
          {
            "id": "turnip_kimchi",
            "method": "腌制罐",
            "name": "萝卜泡菜",
            "durationMinutes": 4320,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-mint-leaf",
    "name": "薄荷叶",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 8640,
    "regrowMinutes": 4320,
    "harvests": 8,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 40,
    "processingOptions": [
      {
        "id": "peppermint_oil",
        "name": "薄荷油",
        "finalUnitPrice": 65,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 120,
        "processingMinutesPerInputMax": 120,
        "stages": [
          {
            "id": "peppermint_oil",
            "method": "研磨机",
            "name": "薄荷油",
            "durationMinutes": 120,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-strawberry",
    "name": "草莓",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 11520,
    "regrowMinutes": 7200,
    "harvests": 5,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 4,
    "unitPrice": 85,
    "processingOptions": [
      {
        "id": "sweetmeats_strawberry",
        "name": "草莓蜜饯",
        "finalUnitPrice": 180,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 2880,
        "processingMinutesPerInputMax": 2880,
        "stages": [
          {
            "id": "sweetmeats_strawberry",
            "method": "腌制罐",
            "name": "草莓蜜饯",
            "durationMinutes": 2880,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-alfalfa",
    "name": "苜蓿草",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 5760,
    "regrowMinutes": 3600,
    "harvests": 5,
    "yieldPerHarvestMin": 1,
    "yieldPerHarvestMax": 1,
    "unitPrice": 30,
    "processingOptions": []
  },
  {
    "id": "crop-succulent",
    "name": "多肉",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 3025,
    "regrowMinutes": 1010,
    "harvests": 1,
    "yieldPerHarvestMin": 1,
    "yieldPerHarvestMax": 1,
    "unitPrice": 60,
    "processingOptions": []
  },
  {
    "id": "crop-wheat",
    "name": "小麦",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 5760,
    "regrowMinutes": 1440,
    "harvests": 1,
    "yieldPerHarvestMin": 3,
    "yieldPerHarvestMax": 3,
    "unitPrice": 55,
    "processingOptions": [
      {
        "id": "flour",
        "name": "面粉",
        "finalUnitPrice": 80,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 30,
        "processingMinutesPerInputMax": 30,
        "stages": [
          {
            "id": "flour",
            "method": "研磨机",
            "name": "面粉",
            "durationMinutes": 30,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      },
      {
        "id": "grain_fishfeed",
        "name": "谷物饲料",
        "finalUnitPrice": 200,
        "outputPerInputMin": 0.333333,
        "outputPerInputMax": 0.333333,
        "processingMinutesPerInputMin": 40,
        "processingMinutesPerInputMax": 40,
        "stages": [
          {
            "id": "grain_fishfeed",
            "method": "饲料机",
            "name": "谷物饲料",
            "durationMinutes": 120,
            "inputCount": 3,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-potato",
    "name": "土豆",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 5760,
    "regrowMinutes": 1920,
    "harvests": 1,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 4,
    "unitPrice": 30,
    "processingOptions": []
  },
  {
    "id": "crop-corn",
    "name": "玉米",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 11520,
    "regrowMinutes": 2305,
    "harvests": 1,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 110,
    "processingOptions": []
  },
  {
    "id": "crop-watermelon",
    "name": "西瓜",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 14400,
    "regrowMinutes": 2880,
    "harvests": 1,
    "yieldPerHarvestMin": 1,
    "yieldPerHarvestMax": 1,
    "unitPrice": 420,
    "processingOptions": [
      {
        "id": "sweetmeats_watermelon",
        "name": "西瓜皮蜜饯",
        "finalUnitPrice": 680,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 2880,
        "processingMinutesPerInputMax": 2880,
        "stages": [
          {
            "id": "sweetmeats_watermelon",
            "method": "腌制罐",
            "name": "西瓜皮蜜饯",
            "durationMinutes": 2880,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-tomato",
    "name": "番茄",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 10080,
    "regrowMinutes": 5760,
    "harvests": 4,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 4,
    "unitPrice": 65,
    "processingOptions": []
  },
  {
    "id": "crop-pepper",
    "name": "辣椒",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 5760,
    "regrowMinutes": 2880,
    "harvests": 7,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 40,
    "processingOptions": [
      {
        "id": "paprika",
        "name": "辣椒粉",
        "finalUnitPrice": 65,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 60,
        "processingMinutesPerInputMax": 60,
        "stages": [
          {
            "id": "paprika",
            "method": "研磨机",
            "name": "辣椒粉",
            "durationMinutes": 60,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-apple",
    "name": "蜡果",
    "layoutType": "shrub",
    "layoutWidth": 3,
    "layoutHeight": 2,
    "matureMinutes": 12960,
    "regrowMinutes": 4320,
    "harvests": 25,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 50,
    "processingOptions": [
      {
        "id": "sweetmeats_apple",
        "name": "蜡果蜜饯",
        "finalUnitPrice": 125,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 2880,
        "processingMinutesPerInputMax": 2880,
        "stages": [
          {
            "id": "sweetmeats_apple",
            "method": "腌制罐",
            "name": "蜡果蜜饯",
            "durationMinutes": 2880,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-coffee-bean",
    "name": "咖啡豆",
    "layoutType": "shrub",
    "layoutWidth": 3,
    "layoutHeight": 2,
    "matureMinutes": 17280,
    "regrowMinutes": 4320,
    "harvests": 25,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 95,
    "processingOptions": [
      {
        "id": "drip_coffee",
        "name": "咖啡粉",
        "finalUnitPrice": 145,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 1440,
        "processingMinutesPerInputMax": 1440,
        "stages": [
          {
            "id": "drip_coffee",
            "method": "烘干箱",
            "name": "咖啡粉",
            "durationMinutes": 1440,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-tea-leaf",
    "name": "茶叶",
    "layoutType": "shrub",
    "layoutWidth": 3,
    "layoutHeight": 2,
    "matureMinutes": 14400,
    "regrowMinutes": 4320,
    "harvests": 25,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 85,
    "processingOptions": [
      {
        "id": "tea_bag",
        "name": "茶叶包",
        "finalUnitPrice": 130,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 1440,
        "processingMinutesPerInputMax": 1440,
        "stages": [
          {
            "id": "tea_bag",
            "method": "烘干箱",
            "name": "茶叶包",
            "durationMinutes": 1440,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-agave",
    "name": "龙舌兰",
    "layoutType": "shrub",
    "layoutWidth": 3,
    "layoutHeight": 2,
    "matureMinutes": 28800,
    "regrowMinutes": 5760,
    "harvests": 1,
    "yieldPerHarvestMin": 1,
    "yieldPerHarvestMax": 1,
    "unitPrice": 1000,
    "processingOptions": [
      {
        "id": "wine_agave",
        "name": "龙舌兰酒",
        "finalUnitPrice": 2500,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 20160,
        "processingMinutesPerInputMax": 20160,
        "stages": [
          {
            "id": "wine_agave",
            "method": "酿酒桶",
            "name": "龙舌兰酒",
            "durationMinutes": 20160,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      },
      {
        "id": "wine_agave>aged_wine_agave",
        "name": "陈酿龙舌兰酒",
        "finalUnitPrice": 5000,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 60480,
        "processingMinutesPerInputMax": 60480,
        "stages": [
          {
            "id": "wine_agave",
            "method": "酿酒桶",
            "name": "龙舌兰酒",
            "durationMinutes": 20160,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          },
          {
            "id": "aged_wine_agave",
            "method": "窖藏架",
            "name": "陈酿龙舌兰酒",
            "durationMinutes": 40320,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-grape",
    "name": "葡萄",
    "layoutType": "vine",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 14400,
    "regrowMinutes": 7200,
    "harvests": 8,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 3,
    "unitPrice": 100,
    "processingOptions": [
      {
        "id": "sweetmeats_grape",
        "name": "葡萄蜜饯",
        "finalUnitPrice": 200,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 2880,
        "processingMinutesPerInputMax": 2880,
        "stages": [
          {
            "id": "sweetmeats_grape",
            "method": "腌制罐",
            "name": "葡萄蜜饯",
            "durationMinutes": 2880,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      },
      {
        "id": "wine",
        "name": "葡萄酒",
        "finalUnitPrice": 400,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 10080,
        "processingMinutesPerInputMax": 10080,
        "stages": [
          {
            "id": "wine",
            "method": "酿酒桶",
            "name": "葡萄酒",
            "durationMinutes": 10080,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      },
      {
        "id": "wine>aged_wine",
        "name": "陈酿葡萄酒",
        "finalUnitPrice": 800,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 30240,
        "processingMinutesPerInputMax": 30240,
        "stages": [
          {
            "id": "wine",
            "method": "酿酒桶",
            "name": "葡萄酒",
            "durationMinutes": 10080,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          },
          {
            "id": "aged_wine",
            "method": "窖藏架",
            "name": "陈酿葡萄酒",
            "durationMinutes": 20160,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-beer-flower",
    "name": "啤酒花",
    "layoutType": "vine",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 10080,
    "regrowMinutes": 2880,
    "harvests": 20,
    "yieldPerHarvestMin": 1,
    "yieldPerHarvestMax": 1,
    "unitPrice": 75,
    "processingOptions": [
      {
        "id": "beer",
        "name": "啤酒",
        "finalUnitPrice": 300,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 7200,
        "processingMinutesPerInputMax": 7200,
        "stages": [
          {
            "id": "beer",
            "method": "酿酒桶",
            "name": "啤酒",
            "durationMinutes": 7200,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      },
      {
        "id": "beer>aged_beer",
        "name": "陈酿啤酒",
        "finalUnitPrice": 600,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 21600,
        "processingMinutesPerInputMax": 21600,
        "stages": [
          {
            "id": "beer",
            "method": "酿酒桶",
            "name": "啤酒",
            "durationMinutes": 7200,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          },
          {
            "id": "aged_beer",
            "method": "窖藏架",
            "name": "陈酿啤酒",
            "durationMinutes": 14400,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-cucumber",
    "name": "黄瓜",
    "layoutType": "vine",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 11520,
    "regrowMinutes": 5760,
    "harvests": 10,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 3,
    "unitPrice": 70,
    "processingOptions": []
  },
  {
    "id": "crop-crawlrus",
    "name": "爬爬柑",
    "layoutType": "vine",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 8640,
    "regrowMinutes": 4320,
    "harvests": 12,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 70,
    "processingOptions": [
      {
        "id": "sweetmeats_crawlrus",
        "name": "爬爬柑蜜饯",
        "finalUnitPrice": 155,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 2880,
        "processingMinutesPerInputMax": 2880,
        "stages": [
          {
            "id": "sweetmeats_crawlrus",
            "method": "腌制罐",
            "name": "爬爬柑蜜饯",
            "durationMinutes": 2880,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-crimson-ascomyceter",
    "name": "绯红子囊菌",
    "layoutType": "mushroom",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 1440,
    "regrowMinutes": 480,
    "harvests": 1,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 15,
    "processingOptions": []
  },
  {
    "id": "crop-chanterelle",
    "name": "黄色真菌",
    "layoutType": "mushroom",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 1440,
    "regrowMinutes": 480,
    "harvests": 1,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 25,
    "processingOptions": []
  },
  {
    "id": "crop-mushroom",
    "name": "香菇",
    "layoutType": "mushroom",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 2880,
    "regrowMinutes": 960,
    "harvests": 1,
    "yieldPerHarvestMin": 2,
    "yieldPerHarvestMax": 2,
    "unitPrice": 75,
    "processingOptions": []
  },
  {
    "id": "crop-toadstool",
    "name": "瘤化菌",
    "layoutType": "mushroom",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 4320,
    "regrowMinutes": 1440,
    "harvests": 1,
    "yieldPerHarvestMin": 1,
    "yieldPerHarvestMax": 2,
    "unitPrice": 5,
    "processingOptions": [
      {
        "id": "fertilizer_mushroom2",
        "name": "有机肥",
        "finalUnitPrice": 50,
        "outputPerInputMin": 2,
        "outputPerInputMax": 2,
        "processingMinutesPerInputMin": 360,
        "processingMinutesPerInputMax": 360,
        "stages": [
          {
            "id": "fertilizer_mushroom2",
            "method": "堆肥桶",
            "name": "有机肥",
            "durationMinutes": 360,
            "inputCount": 1,
            "outputMin": 2,
            "outputMax": 2
          }
        ]
      },
      {
        "id": "fertilizer_tree_mushroom2",
        "name": "有机树肥",
        "finalUnitPrice": 100,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 720,
        "processingMinutesPerInputMax": 720,
        "stages": [
          {
            "id": "fertilizer_tree_mushroom2",
            "method": "乔木堆肥桶",
            "name": "有机树肥",
            "durationMinutes": 720,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  },
  {
    "id": "crop-eden-flower",
    "name": "伊甸果",
    "layoutType": "generic",
    "layoutWidth": 2,
    "layoutHeight": 2,
    "matureMinutes": 10080,
    "regrowMinutes": 4320,
    "harvests": 3,
    "yieldPerHarvestMin": 1,
    "yieldPerHarvestMax": 1,
    "unitPrice": 800,
    "processingOptions": [
      {
        "id": "eden_wine",
        "name": "伊甸果酒",
        "finalUnitPrice": 1600,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 7200,
        "processingMinutesPerInputMax": 7200,
        "stages": [
          {
            "id": "eden_wine",
            "method": "酿酒桶",
            "name": "伊甸果酒",
            "durationMinutes": 7200,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      },
      {
        "id": "eden_wine>aged_eden_wine",
        "name": "陈酿伊甸果酒",
        "finalUnitPrice": 3200,
        "outputPerInputMin": 1,
        "outputPerInputMax": 1,
        "processingMinutesPerInputMin": 21600,
        "processingMinutesPerInputMax": 21600,
        "stages": [
          {
            "id": "eden_wine",
            "method": "酿酒桶",
            "name": "伊甸果酒",
            "durationMinutes": 7200,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          },
          {
            "id": "aged_eden_wine",
            "method": "窖藏架",
            "name": "陈酿伊甸果酒",
            "durationMinutes": 14400,
            "inputCount": 1,
            "outputMin": 1,
            "outputMax": 1
          }
        ]
      }
    ]
  }
];
