package com.duke.controller;

import com.duke.Dao.RolesDao;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")

public class RolesController {

    @Autowired
    private RolesDao rolesDao;



    /**
     * GET request to return all roles in roles table.
     * <p>
     * /roles/
     *
     * @return
     */

    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value ="/",
            method = RequestMethod.GET)
    public ResponseEntity<String> searchAllRoles() {
        try {
            System.out.println("In AdminController... searchAllRoles()");

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
     * POST request to add new role in roles table.
     *
     * /roles/
     *
     * Input ex: {"Name": "Teacher"}
     *
     * @param params
     * @return
     */
    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/",
            method = RequestMethod.POST)
    public ResponseEntity<String> addRole(@RequestBody String params) {
        try {
            System.out.println("In AdminController... addRole()");

            JSONObject jsonObj = new JSONObject(params);
            String newName = jsonObj.getString("Name").trim();

            if (newName.length() <1 ) {
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






}

