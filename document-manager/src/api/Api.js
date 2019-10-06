import axios from "axios";

const LSK_KEY = "auth";

const files = {
  /** api for adding a new file */
  add: body =>
    axios.post(
      "/api/v1/files/add",
      {
        name: body.name,
        file_id: body.file_id,
        expiry: body.expiry,
        department: body.department
      },
      security.getHeader()
    ),

  /** api for fetching all files of a user */
  get: () => axios.get("/api/v1/files/get_all", security.getHeader()),

  /** api for downloading a file */
  download: (id, name) =>
    fetch("/api/v1/files/fetch/" + id, {
      headers: new Headers({
        "x-api-key": window.localStorage.getItem(LSK_KEY)
      })
    })
      .then(resp => resp.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        if (name == null || name === "") {
          a.download = id + ".txt";
        } else {
          a.download = name + ".txt";
        }
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.log(err)),

  /** api for updating a file and creating a new revision of that file */
  update: body =>
    axios.post(
      "/api/v1/files/update",
      {
        file_id: body.file_id,
        data: body.data
      },
      security.getHeader()
    ),
  pullData: id => axios.get("/api/v1/files/pull/" + id, security.getHeader()),
  delete: body =>
    axios.post(
      "/api/v1/files/delete",
      { file_id: body.file_id },
      security.getHeader()
    )
};

const security = {
  getHeader: () => {
    return {
      headers: {
        "x-api-key": window.localStorage.getItem(LSK_KEY)
      }
    };
  }
};

export default {
  files
};
