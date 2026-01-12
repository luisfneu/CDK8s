from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/health")
def health():
    return "ok", 200

@app.route("/sum")
def soma():
    try:
        a = float(request.args.get("a", 0))
        b = float(request.args.get("b", 0))
        return jsonify({
            "a": a,
            "b": b,
            "resultado": a + b
        })
    except:
        return jsonify({"erro": "error error error"}), 400

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002)
