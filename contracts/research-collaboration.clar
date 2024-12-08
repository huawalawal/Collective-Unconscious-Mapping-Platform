;; research-collaboration contract

(define-data-var next-project-id uint u0)

(define-map research-projects
  { project-id: uint }
  {
    title: (string-utf8 100),
    description: (string-utf8 500),
    collaborators: (list 10 principal),
    status: (string-ascii 20)
  }
)

(define-public (create-project (title (string-utf8 100)) (description (string-utf8 500)))
  (let
    (
      (project-id (var-get next-project-id))
    )
    (map-set research-projects
      { project-id: project-id }
      {
        title: title,
        description: description,
        collaborators: (list tx-sender),
        status: "active"
      }
    )
    (var-set next-project-id (+ project-id u1))
    (ok project-id)
  )
)

(define-public (add-collaborator (project-id uint) (collaborator principal))
  (let
    (
      (project (unwrap! (map-get? research-projects { project-id: project-id }) (err u404)))
    )
    (asserts! (is-some (index-of (get collaborators project) tx-sender)) (err u403))
    (ok (map-set research-projects
      { project-id: project-id }
      (merge project { collaborators: (unwrap! (as-max-len? (append (get collaborators project) collaborator) u10) (err u400)) })
    ))
  )
)

(define-public (update-project-status (project-id uint) (new-status (string-ascii 20)))
  (let
    (
      (project (unwrap! (map-get? research-projects { project-id: project-id }) (err u404)))
    )
    (asserts! (is-some (index-of (get collaborators project) tx-sender)) (err u403))
    (ok (map-set research-projects
      { project-id: project-id }
      (merge project { status: new-status })
    ))
  )
)

(define-read-only (get-project (project-id uint))
  (map-get? research-projects { project-id: project-id })
)

