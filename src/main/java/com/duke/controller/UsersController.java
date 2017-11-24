package com.duke.controller;

import com.duke.Dao.*;
import com.duke.Entity.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")

public class UsersController {
    @Autowired
    private UsersDao usersDao;

    /**
     * POST request to get user's user, role, and location info by UserId.
     * <p>
     * /users/
     * <p>
     * Input ex: { "UserId": "reichertb" }
     */

    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/",
            method = RequestMethod.POST,
            consumes = MediaType.APPLICATION_JSON_VALUE
    )

    public ResponseEntity<String> SearchUserbyUserId(@RequestBody String params) {
        try {
            JSONObject obj = new JSONObject();
            JSONObject jsonObj = new JSONObject(params);
            String userId = jsonObj.getString("UserId");

            List<Users> results = usersDao.getUserByUserId(userId);

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
            String errorMessage = ex + "error";
            return new ResponseEntity<String>(errorMessage, HttpStatus.BAD_REQUEST);
        }
    }

    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/authorization",
            method = RequestMethod.GET
    )

    public ResponseEntity<String> getAuthorization() {
        try {

            JSONObject obj = new JSONObject();
            List<Users> results = usersDao.getAuthorization();

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


}
