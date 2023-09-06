import os
from flask import Flask, request, jsonify, send_from_directory,send_file,make_response
import uuid
from flask_cors import CORS
import base64

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

CORS(app)


@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        user_id = request.form.get('userId')
        if not user_id:
            return jsonify({'error': 'User ID is missing in the request'}), 400

        user_folder = os.path.join(app.config['UPLOAD_FOLDER'], user_id)
        if not os.path.exists(user_folder):
            os.makedirs(user_folder)
        files = request.files.getlist('files')
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
def get_folder_structure(user_id):
    user_folder = os.path.join(app.config['UPLOAD_FOLDER'], user_id)

    if not os.path.exists(user_folder):
        return jsonify([])  

    folder_structure = generate_folder_structure(user_folder)
    print(folder_structure)
    return jsonify([folder_structure])  


@app.route('/download/<user_id>/<file_name>', methods=['GET'])
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
def open_file(user_id, file_name):
    user_folder = os.path.join(app.config['UPLOAD_FOLDER'], user_id)
    file_path = os.path.join(user_folder, file_name)

    try:
        if os.path.exists(file_path) and file_name.endswith(".pdf"):
            # Determine the content type based on the file extension
            content_type = "application/pdf"

            # Create a response with the file data and set headers
            response = make_response(send_file(file_path, mimetype=content_type, as_attachment=True, download_name=file_name))
            response.headers["Content-Type"] = content_type

            return response
        else:
            return jsonify({'error': 'PDF file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
