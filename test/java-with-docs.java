package com.example;

import java.util.List;
import java.util.ArrayList;

/**
 * A sample class demonstrating Java documentation generation.
 * This class implements the SampleInterface and provides various methods
 * for demonstration purposes.
 */
public class SampleClass implements SampleInterface {
    /**
     * A constant field that holds a default value.
     */
    private static final String CONSTANT_FIELD = "Constant";
    
    /**
     * Internal counter for tracking operations.
     */
    private int counter;
    
    /**
     * The name associated with this instance.
     */
    private String name;
    
    /**
     * Default constructor that initializes the counter to zero.
     */
    public SampleClass() {
        this.counter = 0;
    }
    
    /**
     * Constructor that initializes the instance with a name.
     * @param name the name to assign to this instance
     */
    public SampleClass(String name) {
        this.name = name;
        this.counter = 0;
    }
    
    /**
     * Gets the name of this instance.
     * @return the name assigned to this instance
     */
    public String getName() {
        return name;
    }
    
    /**
     * Sets the name for this instance.
     * @param name the new name to assign
     */
    public void setName(String name) {
        this.name = name;
    }
    
    /**
     * Performs a standard action by printing a message.
     * This method demonstrates basic functionality.
     */
    public void performAction() {
        System.out.println("Action performed.");
    }
    
    /**
     * Increments the internal counter by the specified amount.
     * @param amount the amount to add to the counter
     * @return the new value of the counter after incrementing
     */
    public int increment(int amount) {
        this.counter += amount;
        return this.counter;
    }
    
    /**
     * Processes a list of items with optional reversal.
     * Creates a new list containing all items from the input list,
     * optionally reversing the order.
     * 
     * @param items the list of items to process
     * @param reverse whether to reverse the order of items
     * @return a new list containing the processed items
     * @throws IllegalArgumentException if the items list is null
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
     * A static utility method that demonstrates static functionality.
     * This method prints a message to indicate it was called.
     */
    public static void staticMethod() {
        System.out.println("Static method called");
    }
}

/**
 * A sample interface defining basic operations.
 */
interface SampleInterface {
    /**
     * Performs the primary action of implementing classes.
     */
    void performAction();
    
    /**
     * Gets the name associated with the implementing instance.
     * @return the name of the instance
     */
    String getName();
}

/**
 * Enumeration representing different status values.
 */
enum Status {
    /**
     * Indicates an active state.
     */
    ACTIVE,
    
    /**
     * Indicates an inactive state.
     */
    INACTIVE,
    
    /**
     * Indicates a pending state.
     */
    PENDING
}

/**
 * An inner utility class for demonstration purposes.
 */
class InnerClass {
    /**
     * A method that demonstrates inner class functionality.
     */
    public void innerMethod() {
        System.out.println("Inner method");
    }
}