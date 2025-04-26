from flask import Flask, jsonify, render_template
import yfinance as yf
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend to access this API

@app.route('/api/history/<symbol>')
def get_stock_history(symbol):
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period="1d", interval="5m")  # You can change to "1mo", "1h", etc.
        if hist.empty:
            return jsonify({"error": "No data found."}), 404

        data = {
            "symbol": symbol.upper(),
            "timestamps": hist.index.strftime("%H:%M").tolist(),
            "prices": hist["Close"].round(2).tolist()
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/price/<symbol>')
def get_stock_price(symbol):
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period="1d", interval="1m")
        current_price = data['Close'].iloc[-1]
        return jsonify({"symbol": symbol.upper(), "price": round(current_price, 2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
