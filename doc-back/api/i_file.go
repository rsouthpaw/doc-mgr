package api

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path"
	"time"

	"../auth"
	"../base"
	"../files"
	"github.com/gorilla/mux"
)

type AddFileRequest struct {
	Name       string    `json:"name"`
	FileId     string    `json:"file_id"`
	Expiry     time.Time `json:"expiry"`
	Department string    `json:"department"`
}
type AddFileResponse struct {
	Success bool `json:"success"`
}
type GetFilesResponse struct {
	Files   []files.File `json:"files"`
	Success bool         `json:"success"`
}
type UpdateFileRequest struct {
	FileId string `json:"file_id"`
	Data   string `json:"data"`
}
type UpdateFileResponse struct {
	Success bool `json:"success"`
}
type DeleteFileRequest struct {
	FileId string `json:"file_id"`
}
type DeleteFileResponse struct {
	Success bool `json:"success"`
}
type PullDataResponse struct {
	Data    string `json:"data"`
	Success bool   `json:"success"`
}

func fileUpload(res http.ResponseWriter, req *http.Request) {
	var (
		status int
		err    error
	)
	defer func() {
		if nil != err {
			http.Error(res, err.Error(), status)
		}
	}()
	token := req.Header.Get("x-api-key")
	log.Println(token)
	if err = req.ParseMultipartForm(32 << 20); nil != err {
		status = http.StatusInternalServerError
		return
	}
	log.Println("Uploading File...Done!")
	for _, fheaders := range req.MultipartForm.File {
		for _, hdr := range fheaders {
			// open uploaded
			var infile multipart.File
			if infile, err = hdr.Open(); nil != err {
				status = http.StatusInternalServerError
				return
			}
			// open destination
			var outfile *os.File
			fileName := files.GetNewFileName()
			if outfile, err = os.Create(path.Join(base.FILE_DIR_BASE_PATH, fileName+".txt")); nil != err {
				status = http.StatusInternalServerError
				return
			}
			// 32K buffer copy
			//var written int64
			if _, err = io.Copy(outfile, infile); nil != err {
				status = http.StatusInternalServerError
				return
			}

			res.Write([]byte(fileName))
		}
	}
}
func addFile(w http.ResponseWriter, r *http.Request) {

	var request AddFileRequest
	var response AddFileResponse

	body, err := ioutil.ReadAll(io.LimitReader(r.Body, DATA_LIMIT))
	if err != nil {
		log.Println("Error: Data exceeds limit", err)
		returnResponse(response, http.StatusBadRequest, w)
		return
	}
	log.Println("body", string(body))

	err = json.Unmarshal(body, &request)
	if err != nil {
		log.Println("ERROR:", err)
		returnResponse(response, http.StatusBadRequest, w)
		return
	}

	var email string
	var valid bool
	if email, _, valid = auth.ValidateToken(r.Header.Get("x-api-key")); !valid {
		log.Println("ERROR:", err)
		returnResponse(response, http.StatusUnauthorized, w)
		return
	}

	log.Println("%+v", request)
	if err := files.AddNewFile(request.FileId, request.Name, email, request.Department, request.Expiry); err != nil {
		log.Println("ERROR:", err)
		returnResponse(response, http.StatusInternalServerError, w)
		return
	} else {
		log.Println("ERROR:", err)
		response.Success = true
		returnResponse(response, http.StatusOK, w)
		return
	}
}
func getFiles(w http.ResponseWriter, r *http.Request) {

	var response GetFilesResponse

	var email, role string
	var valid bool
	if email, role, valid = auth.ValidateToken(r.Header.Get("x-api-key")); !valid {
		log.Println("Invalid token received", r.Header.Get("x-api-key"))
		returnResponse(response, http.StatusUnauthorized, w)
		return
	}

	if role == base.ROLE_DEPARTMENT {
		if files, err := files.GetFilesByDepartment(); err != nil {
			log.Println("ERROR:", err)
			returnResponse(response, http.StatusInternalServerError, w)
			return
		} else {
			log.Println("ERROR:", err)
			response.Files = files
			response.Success = true
			returnResponse(response, http.StatusOK, w)
			return
		}
	} else {
		if files, err := files.GetFiles(email); err != nil {
			log.Println("ERROR:", err)
			returnResponse(response, http.StatusInternalServerError, w)
			return
		} else {
			log.Println("ERROR:", err)
			response.Files = files
			response.Success = true
			returnResponse(response, http.StatusOK, w)
			return
		}
	}

}
func downloadFile(w http.ResponseWriter, r *http.Request) {

	if _, _, valid := auth.ValidateToken(r.Header.Get("x-api-key")); !valid {
		log.Println("Invalid token received", r.Header.Get("x-api-key"))
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	fileName := vars["file"]

	if data, err := files.ReadFile(fileName); err != nil {
		log.Println("ERROR:", err)
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusNotFound)
		return
	} else {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		w.Write(data)
		return
	}
}
func updateFile(w http.ResponseWriter, r *http.Request) {

	var request UpdateFileRequest
	var response UpdateFileResponse

	body, err := ioutil.ReadAll(io.LimitReader(r.Body, DATA_LIMIT))
	if err != nil {
		log.Println("Error: Data exceeds limit", err)
		returnResponse(response, http.StatusBadRequest, w)
		return
	}
	log.Println("body", string(body))

	err = json.Unmarshal(body, &request)
	if err != nil {
		log.Println("ERROR:", err)
		returnResponse(response, http.StatusBadRequest, w)
		return
	}

	if _, _, valid := auth.ValidateToken(r.Header.Get("x-api-key")); !valid {
		log.Println("ERROR:", err)
		returnResponse(response, http.StatusUnauthorized, w)
		return
	}

	if err := files.UpdateFile(request.FileId, request.Data); err != nil {
		log.Println("ERROR:", err)
		returnResponse(response, http.StatusInternalServerError, w)
		return
	} else {
		log.Println("ERROR:", err)
		response.Success = true
		returnResponse(response, http.StatusOK, w)
		return
	}
}
func deleteFile(w http.ResponseWriter, r *http.Request) {

	var request DeleteFileRequest
	var response DeleteFileResponse

	body, err := ioutil.ReadAll(io.LimitReader(r.Body, DATA_LIMIT))
	if err != nil {
		log.Println("Error: Data exceeds limit", err)
		returnResponse(response, http.StatusBadRequest, w)
		return
	}
	log.Println("body", string(body))

	err = json.Unmarshal(body, &request)
	if err != nil {
		log.Println("ERROR:", err)
		returnResponse(response, http.StatusBadRequest, w)
		return
	}

	if _, _, valid := auth.ValidateToken(r.Header.Get("x-api-key")); !valid {
		log.Println("ERROR:", err)
		returnResponse(response, http.StatusUnauthorized, w)
		return
	}

	log.Println("%+v", request)
	if err := files.DeleteFile(request.FileId); err != nil {
		log.Println("ERROR:", err)
		returnResponse(response, http.StatusInternalServerError, w)
		return
	} else {
		log.Println("ERROR:", err)
		response.Success = true
		returnResponse(response, http.StatusOK, w)
		return
	}
}
func pullFileData(w http.ResponseWriter, r *http.Request) {

	var response PullDataResponse

	if _, _, valid := auth.ValidateToken(r.Header.Get("x-api-key")); !valid {
		log.Println("Invalid token received", r.Header.Get("x-api-key"))
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	fileName := vars["file"]

	if data, err := files.PullFileData(fileName); err != nil {
		log.Println("ERROR:", err)
		returnResponse(response, http.StatusInternalServerError, w)
		return
	} else {
		response.Success = true
		response.Data = data
		returnResponse(response, http.StatusOK, w)
		return
	}
}
