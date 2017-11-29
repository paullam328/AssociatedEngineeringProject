package com.duke.controller;

import com.duke.Dao.LocationsDao;
import org.apache.commons.lang3.text.WordUtils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/locations")

public class LocationsController {

    @Autowired
    private LocationsDao locationsDao;

    /**
     * Create -
     *
     * POST request to create new location in locations table.
     *
     * /locations/
     *
     * Input ex: {"addLocationsName": "North Pole", "addLocationsCode": "npe" }
     *
     * TODO: change locations table PK to auto_increment
     *
     * @param params
     * @return
     */
    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/",
            method = RequestMethod.POST)
    public ResponseEntity<String> createLocation(@RequestBody String params) {
        try {

            JSONObject jsonObj = new JSONObject(params);
            String newName = jsonObj.getString("addLocationsName").trim();
            String newCode = jsonObj.getString("addLocationsCode").trim();


            if (newName.length() < 1 && newCode.length() < 1) {
                // input too short
                // return 400
                return new ResponseEntity<String>("400  Input too short.", HttpStatus.BAD_REQUEST);
            } else {
                newName = WordUtils.capitalizeFully(newName);
                newCode = newCode.toLowerCase();

                boolean isCreated = locationsDao.addLocation(newName, newCode);

                if (isCreated) {
                    JSONObject obj = new JSONObject();
                    List<JSONObject> results = locationsDao.getAllLocations();
                    obj.put("results", results);
                    return new ResponseEntity<String>(obj.toString(), HttpStatus.OK);
                } else {
                    return new ResponseEntity<String>("403  Fobidden. User doesn't have permission for this request.", HttpStatus.FORBIDDEN);
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
     *
     * GET request to return all locations in locations table.
     *
     * /locations/
     *
     * @return
     */

    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/",
            method = RequestMethod.GET)
    public ResponseEntity<String> searchAllLocations() {
        try {
            JSONObject obj = new JSONObject();
            List<JSONObject> results = locationsDao.getAllLocations();

            if (results.size() < 1) {
                // no results found
                // return 404
                return new ResponseEntity<String>("404  No results found.", HttpStatus.NOT_FOUND);
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
     *
     * PUT request to update the locations name and/or locations code for the given locations id.
     *
     * /locations/
     *
     * Input ex: {"updateLocationsId": "1", "updateLocationsName": "South Pole", "updateLocationsCode": "spe" }
     *           {"updateLocationsId": "1", "updateLocationsName": "", "updateLocationsCode": "spe" }
     *           {"updateLocationsId": "1", "updateLocationsName": "South Pole", "updateLocationsCode": "" }
     *
     *
     * @param params
     * @return
     */

    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/",
            method = RequestMethod.PUT)
    public ResponseEntity<String> updateLocation(@RequestBody String params) {
        try {

            JSONObject jsonObj = new JSONObject(params);
            String locationsId = jsonObj.getString("updateLocationsId").trim();
            String newLocationsName = jsonObj.getString("updateLocationsName").trim();
            String newLocationsCode = jsonObj.getString("updateLocationsCode").trim();

            if (newLocationsName.length() < 1 && newLocationsCode.length() < 1) {
                // input too short
                // return 400
                return new ResponseEntity<String>(HttpStatus.BAD_REQUEST);
            } else {
                newLocationsName = WordUtils.capitalizeFully(newLocationsName);
                newLocationsCode = newLocationsCode.toLowerCase();

                boolean isUpdated = locationsDao.updateLocation(newLocationsName, newLocationsCode, locationsId);

                System.out.println("isUpdated: " + isUpdated);

                if (isUpdated) {
                    JSONObject obj = new JSONObject();
                    List<JSONObject> results = locationsDao.getAllLocations();
                    obj.put("results", results);
                    return new ResponseEntity<String>(obj.toString(), HttpStatus.OK);
                } else {
                    return new ResponseEntity<String>("403  Fobidden. User doesn't have permission for this request.", HttpStatus.FORBIDDEN);
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
     * DELETE request to delete location entry.
     *
     * /locations/
     *
     * Input ex: {"deleteLocationsId": "1"}
     *
     * @param params
     * @return
     */
    @CrossOrigin
    @ResponseBody
    @RequestMapping(
            value = "/",
            method = RequestMethod.DELETE)
    public ResponseEntity<String> deleteLocation(@RequestBody String params) {
        try {

            JSONObject jsonObj = new JSONObject(params);
            String locationsId = jsonObj.getString("deleteLocationsId").trim();

            boolean isDeleted = locationsDao.deleteLocation(locationsId);
            System.out.println("isUpdated: " + isDeleted);

            if (isDeleted) {
                JSONObject obj = new JSONObject();
                List<JSONObject> results = locationsDao.getAllLocations();
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
