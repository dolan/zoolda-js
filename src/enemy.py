import pygame

class Enemy(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()

        # Load enemy image
        self.image = pygame.image.load("path/to/enemy_image.png").convert_alpha()

        # Get the rect of the image
        self.rect = self.image.get_rect()

        # Set the initial position
        self.rect.x = x
        self.rect.y = y

        # Enemy stats
        self.health = 50
        self.speed = 2

    def update(self):
        # Handle enemy movement, AI, etc.
        pass

    def draw(self, screen):
        # Draw the enemy on the screen
        screen.blit(self.image, self.rect)
