# KafkaJS OpenTelemetry test app

This repo contains a minimal KafkaJS consumer app plus Kubernetes manifests for running Kafka and the consumer in-cluster. The deployment is annotated for OpenTelemetry Operator auto-instrumentation.

## Build the container image

```sh
docker build -t kafka-otel-consumer:latest .
```

Load the image into your cluster (example for kind):

```sh
kind load docker-image kafka-otel-consumer:latest
```

## Deploy Kafka and the app

```sh
kubectl apply -f k8s/kafka.yaml
kubectl apply -f k8s/app.yaml
```

## Produce a test message

```sh
kubectl run kafka-producer -i --rm --restart=Never \
  --image=bitnami/kafka:3.6 -- \
  kafka-console-producer.sh \
  --bootstrap-server kafka:9092 \
  --topic otel-demo
```

Type a message and press enter. You should see it in the consumer logs:

```sh
kubectl logs deploy/kafka-otel-consumer
```
