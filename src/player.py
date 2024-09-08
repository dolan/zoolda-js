import pygame

class Player(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()

        # Load player image
        self.image = pygame.image.load("path/to/player_image.png").convert_alpha()

        # Get the rect of the image
        self.rect = self.image.get_rect()

        # Set the initial position
        self.rect.x = x
        self.rect.y = y

        # Player stats
        self.health = 100
        self.speed = 5

    def update(self):
        # Handle player movement, animation, etc.
        pass

    def draw(self, screen):
        # Draw the player on the screen
        screen.blit(self.image, self.rect)
