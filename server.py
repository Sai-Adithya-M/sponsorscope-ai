import os
import json
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
import urllib.parse

from services.tabpfn_engine import TabPFNEngine
from services.gemma_engine import GemmaEngine
from services.serpapi_engine import SerpApiBrandIntel

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class SponsorScopeHandler(BaseHTTPRequestHandler):
    tabpfn = TabPFNEngine()
    gemma = GemmaEngine()
    brand_intel = SerpApiBrandIntel()

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200, "text/plain")

    def do_HEAD(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        if path == "/" or path == "":
            path = "/index.html"
        file_path = os.path.join(os.getcwd(), "frontend", path.lstrip("/"))
        if os.path.isfile(file_path):
            mime_type, _ = mimetypes.guess_type(file_path)
            self._set_headers(200, mime_type or "application/octet-stream")
        else:
            self._set_headers(200, "application/json")

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == "/api/health":
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "status": "healthy",
                "app": "SponsorScope AI",
                "version": "1.0.0",
                "engines": {
                    "tabpfn": "Prior Labs TabPFN-3.5 Tabular Predictor",
                    "gemma": "Google Gemma 2 Open-Weight Agent",
                    "deployment": "Render Ready"
                }
            }).encode("utf-8"))
            return

        elif path == "/api/benchmark-data":
            self._set_headers(200)
            data = self.tabpfn.benchmark_data[:20]
            self.wfile.write(json.dumps({
                "total_samples": len(self.tabpfn.benchmark_data),
                "samples": data
            }).encode("utf-8"))
            return

        elif path == "/api/presets":
            presets = [
                {
                    "id": "nordvpn",
                    "title": "NordVPN — Integrated YouTube Spot",
                    "email": """Hi Alex,

I'm reaching out from the influencer marketing team at NordVPN. We came across your YouTube channel and think your coding and tech videos would be an excellent fit for our upcoming Q4 cybersecurity privacy campaign.

We'd love to sponsor a 60-second integrated shoutout in one of your videos scheduled for next month. Our standard starter creator budget for this tier is $450 flat, and we'd require a 30-day category exclusivity on other VPN/privacy tool mentions.

Let us know if you have video slots open and if this rate works for your schedule!

Best,
Sarah Miller | NordVPN Creator Partnerships""",
                    "creator_profile": {
                        "creator_name": "Alex Rivers",
                        "channel_name": "DevPulse",
                        "platform": "YouTube",
                        "niche": "Tech & Software",
                        "followers": 52000,
                        "median_views": 22000,
                        "engagement_rate": 4.6
                    }
                },
                {
                    "id": "notion",
                    "title": "Notion — Newsletter & Workflow Feature",
                    "email": """Hello Alex!

Big fans of your weekly DevPulse newsletter! We're planning our productivity feature campaign for November and would love to feature Notion as the main sponsor for an upcoming edition.

We're looking for a dedicated feature blurb (approx 150 words + custom signup link) showcasing how you organize your dev projects or sprint notes. We usually budget around $300 for sponsored sections.

Does your newsletter have availability in the next 3 weeks? Would love to share our creative brief.

Cheers,
Marcus Chen | Notion Growth & Community""",
                    "creator_profile": {
                        "creator_name": "Alex Rivers",
                        "channel_name": "DevPulse Newsletter",
                        "platform": "Newsletter",
                        "niche": "Tech & AI",
                        "followers": 18500,
                        "median_views": 8200,
                        "engagement_rate": 44.0
                    }
                },
                {
                    "id": "supabase",
                    "title": "Supabase — Podcast Mid-Roll Integration",
                    "email": """Hey Alex,

Love the podcast conversations you've been hosting on software architecture. We're ramping up developer awareness for Supabase Vector and new Auth features this quarter.

We want to explore sponsoring 2 episodes of your podcast with a 60-second mid-roll read where you highlight our Postgres + Vector features with a trackable URL in show notes. We can do $350 per episode ($700 total).

Let us know your current availability for recording!

Best,
Dave K. | Supabase DevRel""",
                    "creator_profile": {
                        "creator_name": "Alex Rivers",
                        "channel_name": "DevPulse Podcast",
                        "platform": "Podcast",
                        "niche": "Web Development",
                        "followers": 29000,
                        "median_views": 12500,
                        "engagement_rate": 5.4
                    }
                },
                {
                    "id": "datadog",
                    "title": "Datadog — B2B Cloud Observability Integration",
                    "email": """Hi Alex,

I lead developer partnerships at Datadog. We've been following your deep-dive tutorials on cloud microservices and distributed tracing.

We'd love to partner with you for a 60-second video integration and companion post covering real-time observability in containerized Kubernetes clusters. Our starting allocation for this integration package is $1,200.

Let us know if your editorial calendar has an opening next month!

Best regards,
Elena Rostova | Datadog Developer Marketing""",
                    "creator_profile": {
                        "creator_name": "Alex Rivers",
                        "channel_name": "DevPulse Cloud",
                        "platform": "YouTube",
                        "niche": "B2B & SaaS",
                        "followers": 68000,
                        "median_views": 31000,
                        "engagement_rate": 4.8
                    }
                }
            ]
            self._set_headers(200)
            self.wfile.write(json.dumps(presets).encode("utf-8"))
            return

        # Serve static files
        if path == "/" or path == "":
            path = "/index.html"

        file_path = os.path.join(os.getcwd(), "frontend", path.lstrip("/"))
        if os.path.isfile(file_path):
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = "text/plain"
            self._set_headers(200, mime_type)
            with open(file_path, "rb") as f:
                self.wfile.write(f.read())
        else:
            self._set_headers(404, "text/plain")
            self.wfile.write(b"404 Not Found")

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            req_json = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            req_json = {}

        if path == "/api/extract-deal":
            raw_email = req_json.get("email_text", "")
            extracted = self.gemma.extract_inbound_deal(raw_email)
            self._set_headers(200)
            self.wfile.write(json.dumps(extracted).encode("utf-8"))
            return

        elif path == "/api/predict-rates":
            creator_profile = req_json.get("creator_profile", {})
            deal_details = req_json.get("deal_details", {})
            rates = self.tabpfn.predict_sponsorship_rates(creator_profile, deal_details)
            self._set_headers(200)
            self.wfile.write(json.dumps(rates).encode("utf-8"))
            return

        elif path == "/api/generate-pitch":
            deal_info = req_json.get("deal_info", {})
            rate_info = req_json.get("rate_info", {})
            creator_info = req_json.get("creator_info", {})
            tone = req_json.get("tone", "balanced")
            pitch = self.gemma.generate_counter_pitch(deal_info, rate_info, creator_info, tone)
            self._set_headers(200)
            self.wfile.write(json.dumps(pitch).encode("utf-8"))
            return

        elif path == "/api/brand-intel":
            brand_name = req_json.get("brand_name", "")
            intel = self.brand_intel.fetch_brand_insights(brand_name)
            self._set_headers(200)
            self.wfile.write(json.dumps(intel).encode("utf-8"))
            return

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

def run_server(start_port=8080):
    port = int(os.environ.get("PORT", start_port))
    for p in range(port, port + 20):
        try:
            server_address = ("", p)
            httpd = ThreadedHTTPServer(server_address, SponsorScopeHandler)
            print(f"SponsorScope server running at http://localhost:{p}")
            httpd.serve_forever()
            break
        except OSError as e:
            if e.errno == 48:
                continue
            raise

if __name__ == "__main__":
    start_port = int(os.environ.get("PORT", 8080))
    run_server(start_port)

