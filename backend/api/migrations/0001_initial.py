from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ApiUser",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("username", models.CharField(max_length=150, unique=True)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("password_hash", models.CharField(max_length=64)),
                ("token", models.CharField(blank=True, default="", max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("last_login_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={"db_table": "api_user"},
        ),
    ]

