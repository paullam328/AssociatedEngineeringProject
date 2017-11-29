package com.duke.controller;

import com.duke.Dao.ContainersDao;
import com.duke.Entity.*;
//import com.sun.org.apache.xpath.internal.operations.String;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Method;
import java.sql.Date;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.sql.*;

@RestController
@RequestMapping("/containers")
public class ContainersController {

    @Autowired
    private ContainersDao containersDao;

    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/",
            method = RequestMethod.POST,
            consumes= MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<String> searchByBoxNumber(@RequestBody String params) {
        try {

            JSONObject obj = new JSONObject();
            JSONObject jsonObj = new JSONObject(params);
            String boxNum = jsonObj.getString("containerNumInput");
            boxNum = boxNum.replaceAll("\\s", "");

            List<JSONObject> results = containersDao.getRecordsinBox(boxNum);

            if (results.size() < 1) {
                // no results found
                // return 404
                return new ResponseEntity<String>("No results found", HttpStatus.NOT_FOUND);
            } else {
                // results found
                // return 200
                obj.put("results", results);
                return new ResponseEntity<String>(obj.toString(), HttpStatus.OK);
            }

        } catch (Exception e) {
            String errorMessage = e + " error";
            return new ResponseEntity<String>(errorMessage, HttpStatus.BAD_REQUEST);

        }
    }


}
