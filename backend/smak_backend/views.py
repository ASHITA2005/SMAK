from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404


def spa_index(request):
    index_path = Path(settings.FRONTEND_DIST_DIR) / "index.html"
    if not index_path.exists():
        raise Http404(
            "Frontend build not found. Run `cd frontend && npm install && npm run build` "
            "to create frontend/dist, or run the Vite dev server on http://localhost:3000."
        )
    return FileResponse(open(index_path, "rb"), content_type="text/html")

