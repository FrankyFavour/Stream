from django.db import models

# Create your models here.


class Anime (models.Model):
    ListChoices = [
    ('watching', 'Watching'),
    ('on_hold', 'On Hold'),
    ('plan_to_watch', 'Plan To Watch'),
    ('dropped', 'Dropped'),
    ('completed', 'Completed'),
]


    animeName = models.CharField(max_length=200)
    age = models.IntegerField()
    description = models.CharField(max_length=300)
    profile = models.ImageField(upload_to='image')
    list = models.CharField(max_length=200, blank=True, choices=ListChoices)
    episode = models.IntegerField()
    genre = models.CharField(max_length=50)
    status = models.CharField(max_length=50)
    japeness = models.CharField(max_length=50, blank=True)
    studio = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.animeName 