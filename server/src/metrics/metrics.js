import client from "prom-client";

const register = new client.Registry();

// Métricas básicas de Node.js (CPU, memoria, etc.)
client.collectDefaultMetrics({ register });

// Histograma para tiempo de respuesta HTTP
const httpRequestDurationMs = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duración de las peticiones HTTP en milisegundos",
  labelNames: ["method", "route", "status_code"],
  buckets: [50, 100, 200, 300, 400, 500, 1000, 2000],
});

register.registerMetric(httpRequestDurationMs);

export function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const responseTimeMs = Date.now() - start;
    const route = req.route && req.route.path ? req.route.path : req.path;

    httpRequestDurationMs
      .labels(req.method, route, res.statusCode)
      .observe(responseTimeMs);
  });

  next();
}

export async function metricsHandler(_req, res) {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}