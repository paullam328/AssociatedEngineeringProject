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
    public boolean addLocation(String newName, String newCode) {
        System.out.println("in addLocation()");
        String currentUserRole = usersDao.getAuthorization();
        System.out.println("currentUserRole: " + currentUserRole);

        if (currentUserRole.equals(ADMIN)) {
            int lastId = getLastLocationId();
            int newId = lastId + 1;
            System.out.println("lastId: " + lastId);
            System.out.println("newId: " + newId);
            final String sql = "INSERT INTO locations (locations.Id, locations.Name, locations.Code) VALUES (?, ?, ?)";
            jdbcTemplate.update(sql, newId, newName, newCode);
            return true;
        } else {
            // user doesn't have permission to add role
            return false;
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
            final String sql = "SELECT * FROM locations ORDER BY locations.Name ASC";
            List<JSONObject> jsonList = jdbcTemplate.query(sql, new RowMapper<JSONObject>() {
                public JSONObject mapRow(ResultSet resultSet, int Id) throws SQLException {
                    JSONObject obj = new JSONObject();
                    obj.put("ID Location", resultSet.getInt("Id"));
                    obj.put("Location Name", resultSet.getString("Name"));
                    obj.put("Location Code", resultSet.getString("Code"));

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
     * Helper function to get the last locations.Id in the table.
     *
     * @return
     */

    public int getLastLocationId() {
        final String sql = "SELECT MAX(locations.Id) AS MaxId FROM locations";

        List<String> strList = jdbcTemplate.query(sql, new RowMapper<String>() {
            @Override
            public String mapRow(ResultSet resultSet, int i) throws SQLException {
                return resultSet.getString("MaxId");
            }
        });

        if (strList.isEmpty()) {
            return 0;
        } else {
            return Integer.parseInt(strList.get(0));
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
                System.out.println("newname length: " + newLocationName.length() + "  newcode length: " + newLocationCode.length());

                if (newLocationName.length() > 1 && newLocationCode.length() < 1) {
                    System.out.println("update location name only");
                    // update location name only
                    sql = "UPDATE locations SET locations.Name = ? WHERE locations.Id = ?";
                    jdbcTemplate.update(sql, newLocationName, id);
                } else if (newLocationName.length() < 1 && newLocationCode.length() > 1) {
                    System.out.println("update location code only");
                    // update location code only
                    sql = "UPDATE locations SET locations.Code = ? WHERE locations.Id = ?";
                    jdbcTemplate.update(sql, newLocationCode, id);
                } else {
                    System.out.println("update both");
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
