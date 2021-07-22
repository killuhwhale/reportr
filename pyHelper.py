t = """
Alfalfa Haylage
 Alfalfa, hay
 Almond, in shell
 Apple
 Barley silage, boot stage
 Barley silage, soft dough
 Barley, grain
 Bermudagrass, hay
 Broccoli
 Bromegrass, forage
 Cabbage
 Canola, grain
 Cantaloupe
 Celery
 Clover-grass, hay
 Corn, grain
 Corn, silage
 Cotton, lint
 Grape
 Lettuce
 Oats, grain
 Oats, hay
 Oats, silage-soft dough
 Orchardgrass, hay
 Pasture
 Pasture, Silage
 Peach
 Pear
 Potato
 Prune
 Ryegrass, hay
 Safflower
 Sorghum
 Sorghum-Sudangrass, forage
 Squash
 Sudangrass, hay
 Sudangrass, silage
 Sugar beets
 Sweet Potato
 Tall Fescue, hay
 Timothy, hay
 Tomato
 Triticale, boot stage
 Triticale, soft dough
 Vetch, forage
 Wheat, grain
 Wheat, Hay
 Wheat, silage, boot stage
 Wheat, silage, soft dough
"""


for item in t.split("\n"):
  print(f'{item.replace(",", "").strip()},')