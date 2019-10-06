package api

import (
	"net/http"

	"github.com/gorilla/mux"
)

func getRouter() *mux.Router {

	router := mux.NewRouter()
	apiV1Router := router.PathPrefix("/api/v1").Subrouter()
	apiV1Router.HandleFunc("/login", login).Methods(http.MethodPost)

	filesRouter := apiV1Router.PathPrefix("/files").Subrouter()
	filesRouter.HandleFunc("/upload", fileUpload).Methods(http.MethodPost, http.MethodPut)
	filesRouter.HandleFunc("/add", addFile).Methods(http.MethodPost)
	filesRouter.HandleFunc("/get_all", getFiles).Methods(http.MethodGet)
	filesRouter.HandleFunc("/update", updateFile).Methods(http.MethodPost)
	filesRouter.HandleFunc("/delete", deleteFile).Methods(http.MethodPost)
	filesRouter.HandleFunc("/fetch/{file}", downloadFile).Methods(http.MethodGet)
	filesRouter.HandleFunc("/pull/{file}", pullFileData).Methods(http.MethodGet)

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./")))

	return router
}
