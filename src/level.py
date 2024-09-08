import pygame
from tile import Tile

class Level:
    def __init__(self, level_data, tile_size):
        self.tile_size = tile_size
        self.level_data = level_data
        self.tiles = pygame.sprite.Group()
        self.create_level()

    def create_level(self):
        for y, row in enumerate(self.level_data):
            for x, tile_type in enumerate(row):
                if tile_type != 0:
                    tile = Tile(x * self.tile_size, y * self.tile_size, self.tile_size, tile_type)
                    self.tiles.add(tile)

    def draw(self, screen):
        self.tiles.draw(screen)
