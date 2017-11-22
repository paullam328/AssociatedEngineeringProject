package com.duke.Dao;

import com.duke.Entity.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Repository
public class RolesDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Create new entry in roles table.
     *
     * @param newName - new roles name to be inserted
     */
    public void addRole(String newName) {
        final String sql = "INSERT INTO roles (roles.Name) VALUES (?)";
        jdbcTemplate.update(sql, newName);
    }

    /**
     * Return all roles from roles table.
     *
     * @return
     */

    public List<JSONObject> getAllRoles() {
        System.out.println("2. in getAllRoles()");
        final String sql = "SELECT * FROM roles ORDER BY roles.Id ASC";

        List<JSONObject> jsonList = jdbcTemplate.query(sql, new RowMapper<JSONObject>() {
            public JSONObject mapRow(ResultSet resultSet, int Id) throws SQLException {
                JSONObject obj = new JSONObject();
                obj.put("rolesId", resultSet.getInt("Id"));
                obj.put("rolesName", resultSet.getString("Name"));

                return obj;
            }
        });
        return jsonList;
    }

    /**
     * Update the roles.name for the given roles.id.
     *
     * @param newRoleName - the new role name
     * @param id - the roles.id corresponding to the role name to be updated
     */
    public boolean updateRole(String newRoleName, String id) {
        try {
            final String sql = "UPDATE roles SET roles.Name = ? WHERE roles.Id = ?";
            jdbcTemplate.update(sql, newRoleName, id);
            return true;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    /**
     * Delete row in roles table for given roles.id.
     *
     * @param id - roles.id
     */

    public boolean deleteRole(String id) {
        try {
            final String sql = "DELETE FROM roles WHERE roles.Id = ?";
            jdbcTemplate.update(sql, id);
            return true;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

}
