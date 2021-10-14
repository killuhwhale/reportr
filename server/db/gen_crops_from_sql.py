crops = """Alfalfa Haylage
  21
  70
  1
  0.09
  0.7
    
  Alfalfa, hay
  8
  10
  3
  0.27
  2.1
    
  Almond, in shell
  0
  0
  6.5
  1.1
  7.05
    
  Apple
  0
  0
  0.3
  0.08
  0.54
    
  Barley silage, boot stage
  8
  70
  0.8
  0.13
  0.58
    
  Barley silage, soft dough
  16
  70
  0.5
  0.08
  0.415
    
  Barley, grain
  3
  10
  1.85
  0.35
  0.5
    
  Bermudagrass, hay
  8
  10
  1.75
  0.23
  2.1
    
  Broccoli
  0
  0
  0.44
  0.075
  0.35
    
  Bromegrass, forage
  0
  0
  1.8
  0.285
  2.45
    
  Cabbage
  0
  0
  0.39
  0.04
  0.3
    
  Canola, grain
  0
  0
  3.8
  0.9
  0.6
    
  Cantaloupe
  0
  0
  0.365
  0.05
  0.54
    
  Celery
  0
  0
  0.19
  0.045
  0.415
    
  Clover-grass, hay
  6
  10
  1.9
  0.25
  2.1
    
  Corn, grain
  5
  10
  1.45
  0.275
  0.3
    
  Corn, silage
  30
  70
  0.4
  0.075
  0.33
    
  Cotton, lint
  3
  0
  1.75
  0.285
  0.58
    
  Grape
  0
  0
  0.415
  0.065
  0.455
    
  Lettuce
  0
  0
  0.24
  0.03
  0.415
    
  Oats, grain
  2
  10
  2.2
  0.325
  0.375
    
  Oats, hay
  4
  10
  2
  0.325
  1.65
    
  Oats, silage-soft dough
  16
  70
  0.5
  0.08
  0.415
    
  Orchardgrass, hay
  6
  10
  1.75
  0.23
  2.1
    
  Pasture
  20
  70
  0.92
  0.13
  0.945
    
  Pasture, Silage
  15
  70
  0.92
  0.13
  0.945
    
  Peach
  0
  0
  0.315
  0.135
  0.33
    
  Pear
  0
  0
  0.285
  0.035
  0.26
    
  Potato
  0
  0
  0.35
  0.065
  0.465
    
  Prune
  0
  0
  0.3
  0.04
  0.36
    
  Ryegrass, hay
  6
  10
  1.6
  0.23
  2.1
    
  Safflower
  2
  0
  5
  0.55
  3.1
    
  Sorghum
  4
  10
  2.5
  0.435
  2
    
  Sorghum-Sudangrass, forage
  0
  0
  2.05
  0.35
  2.45
    
  Squash
  0
  0
  0.42
  0.04
  0.5
    
  Sudangrass, hay
  8
  10
  1.6
  0.22
  1.65
    
  Sudangrass, silage
  8
  70
  0.55
  0.085
  0.6
    
  Sugar beets
  30
  0
  0.425
  0.045
  0.75
    
  Sweet Potato
  0
  0
  0.52
  0.1
  0.83
    
  Tall Fescue, hay
  6
  10
  1.6
  0.23
  2.1
    
  Timothy, hay
  6
  10
  1.75
  0.23
  2.1
    
  Tomato
  75
  90
  0.125
  0.045
  0.285
    
  Triticale, boot stage
  12
  70
  0.75
  0.135
  0.58
    
  Triticale, soft dough
  22
  70
  0.5
  0.085
  0.375
    
  Vetch, forage
  0
  0
  0
  0
  0
    
  Wheat, grain
  3
  10
  2.9
  0.545
  2.5
    
  Wheat, Hay
  4
  10
  1.65
  0.255
  1.245
    
  Wheat, silage, boot stage
  10
  70
  0.8
  0.14
  0.6
    
  Wheat, silage, soft dough
  18
  70
  0.55
  0.085
  0.415
  """

_split = crops.split("\n")

crop_titles = dict()

for i, crop in enumerate(_split[::7]):
  row = i * 7
  title = _split[row].strip().replace(',', '')
  typical_yield = _split[row + 1].strip()
  moisture = _split[row + 2].strip()
  n = _split[row + 3].strip()
  p = _split[row + 4].strip()
  k = _split[row + 5].strip()
  salt = _split[row + 6].strip() if _split[row + 6].strip() else 0 
  crop_titles[title] = title
  # stmt = f"INSERT INTO crops(title, typical_yield, moisture, n, p, k, salt)VALUES('{title.replace(''',''', '''''')}',{typical_yield},{moisture},{round(float(n)*20, 2)},{round(float(p)*20, 2)},{round(float(k)*20, 2)},{round(float(salt)*20, 2)});"
  # print(stmt)

print(crop_titles)

