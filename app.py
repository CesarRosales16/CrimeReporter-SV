from flask import Flask, request, jsonify
import joblib
import traceback
import pandas as pd
import numpy as np

app = Flask(__name__)
rbf = joblib.load("model/modelo_rbf.pkl")
mun = joblib.load("model/encode_mun.pkl")


@app.route('/predict', methods=['POST'])
def predict():
    if rbf:
        try:
            json_request = request.json
            print(json_request)        
            year = int(json_request[0]["year"]) if type(json_request) == type([]) else int(json_request["year"])
            array_response = []
            for mun_enc in range(0,262):
                #print(mun.get(mun_enc))
                prediction = rbf.predict([[year, mun_enc]])[0]
                prediction_result = int(np.ceil(np.abs(prediction)))
                mun_split = mun.get(mun_enc).split(',')
                array_response.append({
                    "codigo_cat": mun_enc,
                    "nom_dpto": mun_split[0],
                    "nom_mun": mun_split[1],                    
                    "total": prediction_result
                })
            return jsonify(array_response)

        except:
            return jsonify({'trace': traceback.format_exc()})
    else:
        print('Train the model first')
        return ('No model here to use')


if __name__ == '__main__':
    rbf = joblib.load("model/modelo_rbf.pkl")
    mun = joblib.load("model/encode_mun.pkl")
    app.run(debug=True)
