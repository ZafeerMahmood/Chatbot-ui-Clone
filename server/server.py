import os
from flask import Flask, request, jsonify, send_from_directory,send_file,make_response
from flask_cors import CORS
import jwt  # requires cryptography
from functools import wraps
from dotenv import load_dotenv
import tracemalloc


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
CORS(app)

load_dotenv(dotenv_path='./.env.local')

tracemalloc.start()
port = int(os.getenv('API_PORT', 3001))
baseUrl = os.getenv('AUTH0_BASE_URL')
issuerBaseUrl = os.getenv('AUTH0_ISSUER_BASE_URL')
audience = os.getenv('AUTH0_AUDIENCE')
client_id=os.getenv('AUTH0_CLIENT_ID')


if not baseUrl or not issuerBaseUrl:
    raise Exception('Please make sure that the file .env.local is in place and populated')

if not audience:
    print('AUTH0_AUDIENCE not set in .env.local. Shutting down API server.')
    exit(1)

def validate_access_token(access_token):
    okta_auth_server =f'{issuerBaseUrl}/'
    jwks_url = f"{issuerBaseUrl}/.well-known/jwks.json"
    try:
        jwks_client = jwt.PyJWKClient(jwks_url, cache_jwk_set=True, lifespan=360)
        signing_key = jwks_client.get_signing_key_from_jwt(access_token)
        data = jwt.decode(
            access_token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=okta_auth_server,
            audience=f"{audience}",
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iat": True,
                "verify_aud": True,
                "verify_iss": True,
            },
        )
        return data
    except jwt.exceptions.PyJWTError as err:
        return False
    
def check_jwt(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        authorization_header = request.headers.get('Authorization')
        if not authorization_header:
            return jsonify({'message': 'Authorization token is missing'}), 401
        parts = authorization_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'message': 'Invalid token format'}), 401

        token = parts[1]

        validated_data = validate_access_token(token)
        if not validated_data:
            return jsonify({'message': 'Invalid token'}), 401

        return f(*args, **kwargs)

    return decorated_function

@app.route('/upload/<user_id>', methods=['POST'])
@check_jwt
def upload_file(user_id):
    print(user_id)
    try:
        if not user_id:
            return jsonify({'error': 'User ID is missing in the request'}), 400

        user_folder = os.path.join(app.config['UPLOAD_FOLDER'], user_id)
        if not os.path.exists(user_folder):
            os.makedirs(user_folder)

        files = request.files.getlist('files') 
        print(files)
        for file in files:
            filename = os.path.join(user_folder, file.filename)
            file.save(filename)

        return jsonify({'message': 'Files uploaded and saved successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


def generate_folder_structure(root_path):
    try:
        folder_structure = {
            "label": os.path.basename(root_path),
            "children": []
        }

        items = os.listdir(root_path)
        items.sort()  

        for item in items:
            item_path = os.path.join(root_path, item)

            if os.path.isdir(item_path):
                folder_structure["children"].append(
                    generate_folder_structure(item_path))
            elif os.path.isfile(item_path):
                folder_structure["children"].append({
                    "label": item
                })

        return folder_structure
    except Exception as e:
        return {
            "label": os.path.basename(root_path),
            "children": []
        }


@app.route('/get_folder_structure/<user_id>', methods=['GET'])
@check_jwt
def get_folder_structure(user_id):
    user_folder = os.path.join(app.config['UPLOAD_FOLDER'], user_id)

    if not os.path.exists(user_folder):
        return jsonify([])  

    folder_structure = generate_folder_structure(user_folder)
    print(folder_structure)
    return jsonify([folder_structure])  


@app.route('/download/<user_id>/<file_name>', methods=['GET'])
@check_jwt
def download_file(user_id, file_name):
    user_folder = os.path.join(app.config['UPLOAD_FOLDER'], user_id)
    file_path = os.path.join(user_folder, file_name)

    try:
        if os.path.exists(file_path):
            return send_from_directory(user_folder, file_name, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    


@app.route('/open/<user_id>/<file_name>', methods=['GET'])
@check_jwt
def open_file(user_id, file_name):
    user_folder = os.path.join(app.config['UPLOAD_FOLDER'], user_id)
    file_path = os.path.join(user_folder, file_name)

    try:
        if os.path.exists(file_path) and file_name.endswith(".pdf"):
            content_type = "application/pdf"
            response = make_response(send_file(file_path, mimetype=content_type, as_attachment=True, download_name=file_name))
            response.headers["Content-Type"] = content_type

            return response
        else:
            return jsonify({'error': 'PDF file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/test', methods=['GET'])
@check_jwt
def testing():
    try:
        return jsonify({'message': 'Hello World!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port ,debug=True)
