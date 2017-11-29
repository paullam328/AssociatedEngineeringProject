package com.duke.controller;

import com.duke.Dao.RolesDao;
import org.apache.commons.lang3.text.WordUtils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")

public class RolesController {

    @Autowired
    private RolesDao rolesDao;

    /**
     * Create -
     * <p>
     * POST request to create new role in roles table.
     * <p>
     * /roles/
     * <p>
     * Input ex: {"addRolesName": "Teacher"}
     *
     * @param params
     * @return
     */
    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/",
            method = RequestMethod.POST)
    public ResponseEntity<String> createRole(@RequestBody String params) {
        try {

            JSONObject jsonObj = new JSONObject(params);
            String newName = jsonObj.getString("addRolesName").trim();      // trim leading and trailing whitespace

            if (newName.length() < 1) {
                // input too short
                // return 400
                return new ResponseEntity<String>(HttpStatus.BAD_REQUEST);
            } else {
                newName = WordUtils.capitalizeFully(newName);       // capitalize 1st letter of each word
                boolean isCreated = rolesDao.addRole(newName);

                if (isCreated) {
                    JSONObject obj = new JSONObject();
                    List<JSONObject> results = rolesDao.getAllRoles();
                    obj.put("results", results);

                    return new ResponseEntity<String>(obj.toString(), HttpStatus.OK);
                } else {
                    return new ResponseEntity<String>("403  Forbidden. User doesn't have permission for this request.", HttpStatus.FORBIDDEN);
                }
            }
        } catch (Exception ex) {
            // return 400
            String errorMessage = ex + " error";
            return new ResponseEntity<String>(errorMessage, HttpStatus.BAD_REQUEST);
        }
    }



    /**
     * Read -
     * <p>
     * GET request to return all roles in roles table.
     * <p>
     * /roles/
     *
     * @return
     */

    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/",
            method = RequestMethod.GET)
    public ResponseEntity<String> searchAllRoles() {
        try {
            System.out.println("In RolesController... searchAllRoles()");

            JSONObject obj = new JSONObject();
            List<JSONObject> results = rolesDao.getAllRoles();

            if (results.size() < 1) {
                // no results found
                // return 404
                return new ResponseEntity<String>("404  No results found", HttpStatus.NOT_FOUND);
            } else {
                // results found
                obj.put("results", results);
                return new ResponseEntity<String>(obj.toString(), HttpStatus.OK);
            }
        } catch (Exception ex) {
            String errorMessage = ex + " error";
            return new ResponseEntity<String>(errorMessage, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Update -
     * <p>
     * POST request to update roles name for the given roles ID.
     * <p>
     * /roles/
     * <p>
     * Input ex: { "updateRolesId": "1", "updateRolesName": "Superman" }
     *
     * @param params
     * @return
     */
    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/",
            method = RequestMethod.PUT)
    public ResponseEntity<String> updateRole(@RequestBody String params) {
        try {

            JSONObject jsonObj = new JSONObject(params);
            String rolesId = jsonObj.getString("updateRolesId").trim();
            String newRolesName = jsonObj.getString("updateRolesName").trim();

            if (newRolesName.length() < 1) {
                // input too short
                // return 400
                return new ResponseEntity<String>("400 Role name is too short.", HttpStatus.BAD_REQUEST);
            } else {
                newRolesName = WordUtils.capitalizeFully(newRolesName);       // capitalize 1st letter of each word
                boolean isUpdated = rolesDao.updateRole(newRolesName, rolesId);

                System.out.println("isUpdated: " + isUpdated);

                if (isUpdated) {
                    JSONObject obj = new JSONObject();
                    List<JSONObject> results = rolesDao.getAllRoles();
                    obj.put("results", results);

                    return new ResponseEntity<String>(obj.toString(), HttpStatus.OK);
                } else {
                    return new ResponseEntity<String>("403  Forbidden. User doesn't have permission for this request.", HttpStatus.FORBIDDEN);
                }
            }
        } catch (Exception ex) {
            // return 400
            String errorMessage = ex + " error";
            return new ResponseEntity<String>(errorMessage, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Delete -
     *
     * DELETE request to remove entry from roles for given roles ID.
     *
     * Input ex: { "deleteRolesId": "7" }
     *
     * @param params
     * @return
     */

    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/",
            method = RequestMethod.DELETE)
    public ResponseEntity<String> deleteRole(@RequestBody String params) {
        try {

            JSONObject jsonObj = new JSONObject(params);
            String rolesId = jsonObj.getString("deleteRolesId").trim();

            boolean isDeleted = rolesDao.deleteRole(rolesId);

            System.out.println("isDeleted: " + isDeleted);

            if (isDeleted) {
                JSONObject obj = new JSONObject();
                List<JSONObject> results = rolesDao.getAllRoles();
                obj.put("results", results);

                return new ResponseEntity<String>(obj.toString(), HttpStatus.OK);
            } else {
                return new ResponseEntity<String>("403  Fobidden. User doesn't have permission for this request.", HttpStatus.FORBIDDEN);
            }
        } catch (Exception ex) {
            // return 400
            String errorMessage = ex + " error";
            return new ResponseEntity<String>(errorMessage, HttpStatus.BAD_REQUEST);
        }
    }

}

