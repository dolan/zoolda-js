import pygame

class Tile(pygame.sprite.Sprite):
    def __init__(self, x, y, size, tile_type):
        super().__init__()

        # Load tile image based on tile_type
        self.image = pygame.image.load(f"path/to/tile_{tile_type}.png").convert_alpha()

        # Scale the image to the desired tile size
        self.image = pygame.transform.scale(self.image, (size, size))

        # Get the rect of the image
        self.rect = self.image.get_rect()

        # Set the tile's position
        self.rect.x = x
        self.rect.y = y
