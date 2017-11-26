package com.duke.Dao;

import com.duke.Entity.*;
import com.duke.Dao.UsersDao;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Repository
public class LocationsDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UsersDao usersDao;

    private String ADMIN = "Administrator";
    private String RMC = "Records Management Clerk";
    private String REG_USER = "Regular User";
    private String DENIED = "Access Denied";

    /**
     * Create new entry in locations table.
     *
     * @param newName - new location name to be inserted
     * @param newCode - new location code to be inserted
     */
    public void addLocation(String newName, String newCode) {
        System.out.println("in addLocation()");
        String currentUserRole = usersDao.getAuthorization();
        System.out.println("currentUserRole: " + currentUserRole);

        if (currentUserRole.equals(ADMIN)) {
            final String sql = "INSERT INTO locations (locations.Name, locations.Code) VALUES (?, ?)";
            jdbcTemplate.update(sql, newName, newCode);
        } else {
            // user doesn't have permission to add role
        }
    }

    /**
     * Return all locations from locations table.
     *
     * @return
     */
    public List<JSONObject> getAllLocations() {
        System.out.println("2. in getAllRoles()");

        String currentUserRole = usersDao.getAuthorization();

        if (currentUserRole.equals(ADMIN)) {
            final String sql = "SELECT * FROM locations ORDER BY locations.Id ASC";
            List<JSONObject> jsonList = jdbcTemplate.query(sql, new RowMapper<JSONObject>() {
                public JSONObject mapRow(ResultSet resultSet, int Id) throws SQLException {
                    JSONObject obj = new JSONObject();
                    obj.put("locationsId", resultSet.getInt("Id"));
                    obj.put("locationsName", resultSet.getString("Name"));
                    obj.put("locationsCode", resultSet.getString("Code"));

                    return obj;
                }
            });
            return jsonList;
        } else {
            System.out.println("RolesDao: getAllRolles() User doesnt have permission to read roles table. They are " + currentUserRole + " but needs to be " + ADMIN);
            // user doesn't have permission to read roles table
            return null;
        }
    }

    /**
     * Update the locations name and/or locations code for the given locations id.
     *
     * @param newLocationName - the new locations name, if any
     * @param newLocationCode - the new locations code, if any
     * @param id - the locations id
     * @return
     */

    public boolean updateLocation(String newLocationName, String newLocationCode, String id) {
        final String sql;

        String currentUserRole = usersDao.getAuthorization();

        if (currentUserRole.equals(ADMIN)) {
            try {
                if (newLocationName.length() > 1 && newLocationCode.length() < 1) {
                    // update location name only
                    sql = "UPDATE locations SET locations.Name = ? WHERE locations.Id = ?";
                    jdbcTemplate.update(sql, newLocationName, id);
                } else if (newLocationName.length() < 1 && newLocationCode.length() > 1) {
                    // update location code only
                    sql = "UPDATE locations SET locations.Code = ? WHERE locations.Id = ?";
                    jdbcTemplate.update(sql, newLocationCode, id);
                } else {
                    // update location name and location code
                    sql = "UPDATE locations SET locations.Name = ?, locations.Code = ? WHERE locations.Id = ?";
                    jdbcTemplate.update(sql, newLocationName, newLocationCode, id);
                }
                return true;
            } catch (Exception ex) {
                ex.printStackTrace();
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Delete the location for the given locations id.
     *
     * @param id - the locations id to be deleted
     * @return
     */
    public boolean deleteLocation (String id) {
        String currentUserRole = usersDao.getAuthorization();

        if (currentUserRole.equals(ADMIN)) {
            try {
                final String sql = "DELETE FROM locations WHERE locations.Id = ?";
                jdbcTemplate.update(sql, id);
                return true;
            } catch (Exception ex) {
                ex.printStackTrace();
                return false;
            }
        } else {
            // user doesn't have permission to delete location
            return false;
        }

    }





}
