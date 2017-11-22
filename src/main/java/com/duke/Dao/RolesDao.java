package com.duke.Dao;

import com.duke.Entity.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;


import javax.xml.stream.Location;
import java.sql.Date;
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
     * Return all roles from roles table.
     *
     * @return
     */

    public List<JSONObject> getAllRoles() {
        final String sql = "SELECT * FROM roles";

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
     * Insert new entry in roles table.
     *
     * @param newName - new roles name to be inserted
     */
    public void addRole(String newName) {
        final String sql = "INSERT INTO roles (roles.Name) VALUES (?)";
        jdbcTemplate.update(sql, newName);
    }

    public void deleteRole(String roleName) {
        final String sql = "DELETE FROM roles WHERE roles.Name = ?";

    }


}
