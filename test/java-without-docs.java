package com.example;

import java.util.List;
import java.util.ArrayList;

/**
 * / **
 *  * Implements SampleInterface to provide basic operations including managing a name and a counter.
 *  * Supports incrementing a counter and processing a list of items with optional reversal.
 *  * Contains both instance and static methods.
 *  * /
 */
public class SampleClass implements SampleInterface {
    /**
     * / **
     *  * Constant string field used as a fixed value throughout the class.
     *  * It is static and final, meaning its value cannot be changed after initialization.
     *  * /
     */
    private static final String CONSTANT_FIELD = "Constant";
    
    /**
     * / **
     *  * Stores the current count value used internally by the SampleClass instance.
     *  * Represents a numeric counter that can be incremented.
     *  * /
     */
    private int counter;
    /**
     * / ** The name associated with this instance. */
     */
    private String name;
    
    /**
     * / **
     *  * Initializes a new instance of SampleClass with the counter set to zero.
     *  * /
     */
    public SampleClass() {
        this.counter = 0;
    }
    
    /**
     * / **  
     *  * Constructs a new SampleClass instance with the specified name.  
     *  * Initializes the counter to zero.  
     *  *  
     *  * @param name the name to be assigned to this instance  
     *  */
     */
    public SampleClass(String name) {
        this.name = name;
        this.counter = 0;
    }
    
    /**
     * / **
     *  * Returns the current value of the name field.
     *  *
     *  * @return the name string
     *  * /
     */
    public String getName() {
        return name;
    }
    
    /**
     * / **
     *  * Sets the name field to the given value.
     *  *
     *  * @param name the new name to set
     *  * /
     */
    public void setName(String name) {
        this.name = name;
    }
    
    /**
     * Performs the defined action by printing "Action performed." to the standard output.
     */
    public void performAction() {
        System.out.println("Action performed.");
    }
    
    /**
     * / **
     *  * Increments the counter by the specified amount.
     *  *
     *  * @param amount the value to add to the counter
     *  * @return the updated counter value after increment
     *  * /
     */
    public int increment(int amount) {
        this.counter += amount;
        return this.counter;
    }
    
    /**
     * / **
     *  * Processes a list of strings by optionally reversing its order.
     *  *
     *  * @param items the list of strings to process; must not be null
     *  * @param reverse if true, the resulting list will be reversed
     *  * @return a new list containing the processed items
     *  * @throws IllegalArgumentException if the input list is null
     *  * /
     */
    public List<String> processItems(List<String> items, boolean reverse) throws IllegalArgumentException {
        if (items == null) {
            throw new IllegalArgumentException("Items cannot be null");
        }
        
        List<String> result = new ArrayList<>(items);
        if (reverse) {
            java.util.Collections.reverse(result);
        }
        return result;
    }
    
    /**
     * Prints a message indicating that the static method has been called.
     */
    public static void staticMethod() {
        System.out.println("Static method called");
    }
}

/**
 * / ** 
 *  * Defines a contract with actions to be performed and a method to retrieve a name.
 *  * Implementing classes must provide behavior for performing an action and returning a name string.
 *  * / 
 * interface SampleInterface {
 *     /**
 *      * Performs an action defined by the implementing class.
 *      */
 *     void performAction();
 * 
 *     /**
 *      * Retrieves the name associated with the implementing instance.
 *      *
 *      * @return the name string
 *      */
 *     String getName();
 * }
 */
interface SampleInterface {
    /****
     * Executes a predefined action.
     */
    void performAction();
    /**
     * / **
     *  * Returns the name associated with this instance.
     *  *
     *  * @return the current name value, or null if none is set
     *  * /
     */
    String getName();
}

/**
 * Represents the status of an entity with predefined states.
 * 
 * <ul>
 *   <li>ACTIVE - indicates the entity is active.</li>
 *   <li>INACTIVE - indicates the entity is inactive.</li>
 *   <li>PENDING - indicates the entity is pending action or approval.</li>
 * </ul>
 */
enum Status {
    /****
     * Indicates that the status is active.
     */
    ACTIVE,
    /**
     * / **
     *  * Indicates that the current status is inactive.
     *  * /
     */
    INACTIVE,
    PENDING
}

class InnerClass {
    public void innerMethod() {
        System.out.println("Inner method");
    }
}