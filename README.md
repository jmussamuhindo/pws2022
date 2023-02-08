# pws2022

## Getting started

#### Installation

* run MongoDB server or use a cloud database (e.g. using https://cloud.mongodb.com/)  
* git clone https://gitlab.com:mariusz.jarocki/pws2022.git
* cd pws2022
* npm install
* copy config-example.json to config.json and customize it (especially dbUrl)
* (once/optionally) create example data using ``node generate_fake_data``

#### Starting the server

* npm start

#### URL to view

* http://localhost:5555

## Tasks for passing the course

#### Requirements for grade 3 (C/sufficient)

* every added task should be equipped in extra field (`creator`), which stores id of the task creator (the person who was logged in during adding the task)
* new button for every (potentially) task - *[take over]*; every logged user can take over the task by creation of new key inside it - `responsible` with the value of id of the user
* the task which was taken over by some user, cannot be taken over by any other user - instead of button *[take over]* we can see a name of the current responsible person for the task
* a responsible person can use a special new button *[done]* - the button create the field `done` with the timestamp of the action

#### Requirements for grade 4 (B/good)

The previous task and:

* new view (new navigation: e.g. *All tasks*), comparing to *Tasks* we can see here all tasks from all projects in one table
* The table view can be filtered using following methods: text filtering (similar to *Persons* and *Projects*) based on the name of the task and responsible person's first- and lastName,
* filtering using the project selected in combobox
* status: (free = without `responsible`/in progress = with `responsible` and without `done`/done = with `done`); the status should be displayed in the table and it should be possible to filter using the status

#### Requirements for grade 5 (A/very good)

The previous task with the security focused changes.

Permissions and prohibitions are defined on both sides, so not only implemented as a lack of some elements (e.g. buttons) but also as a function not allowed using some rest client.

* adding tasks is possible only for project managers
* taking over is possible only for project members
* the view from the task for grade 4 is accessible only for users with the special flag `admin` set to true
* the view *Persons* and *Projects* are read only for non-admin users