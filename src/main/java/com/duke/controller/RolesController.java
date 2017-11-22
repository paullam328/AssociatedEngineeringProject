package com.duke.controller;

import com.duke.Dao.RolesDao;
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
     * Input ex: {"rolesName": "Teacher"}
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
            System.out.println("In AdminController... addRole()");

            JSONObject jsonObj = new JSONObject(params);
            String newName = jsonObj.getString("rolesName").trim();

            if (newName.length() < 1) {
                // input too short
                // return 400
                return new ResponseEntity<String>(HttpStatus.BAD_REQUEST);
            } else {
                rolesDao.addRole(newName);
                return new ResponseEntity<String>(HttpStatus.OK);
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
            System.out.println("1. In AdminController... searchAllRoles()");

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
     * Input ex: { "RolesId": "1", "newRolesName": "Superman" }
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
            System.out.println("In AdminController... updateRole()");

            JSONObject jsonObj = new JSONObject(params);
            String rolesId = jsonObj.getString("RolesId").trim();
            String newRolesName = jsonObj.getString("newRolesName").trim();

            if (newRolesName.length() < 1) {
                // input too short
                // return 400
                return new ResponseEntity<String>(HttpStatus.BAD_REQUEST);
            } else {
                boolean isUpdated = rolesDao.updateRole(newRolesName, rolesId);
                System.out.println("isUpdated: " + isUpdated);
                if (isUpdated) {
                    return new ResponseEntity<String>(HttpStatus.OK);
                } else {
                    return new ResponseEntity<String>(HttpStatus.NOT_FOUND);
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
     * Input ex: { "RolesId": "7" }
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
            System.out.println("In AdminController... updateRole()");

            JSONObject jsonObj = new JSONObject(params);
            String rolesId = jsonObj.getString("RolesId").trim();

            boolean isUpdated = rolesDao.deleteRole(rolesId);
            System.out.println("isUpdated: " + isUpdated);

            if (isUpdated) {
                return new ResponseEntity<String>(HttpStatus.OK);
            } else {
                return new ResponseEntity<String>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception ex) {
            // return 400
            String errorMessage = ex + " error";
            return new ResponseEntity<String>(errorMessage, HttpStatus.BAD_REQUEST);
        }
    }

}

