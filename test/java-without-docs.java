package com.example;

import java.util.List;
import java.util.ArrayList;

public class SampleClass implements SampleInterface {
    private static final String CONSTANT_FIELD = "Constant";
    
    private int counter;
    private String name;
    
    public SampleClass() {
        this.counter = 0;
    }
    
    public SampleClass(String name) {
        this.name = name;
        this.counter = 0;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public void performAction() {
        System.out.println("Action performed.");
    }
    
    public int increment(int amount) {
        this.counter += amount;
        return this.counter;
    }
    
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
    
    public static void staticMethod() {
        System.out.println("Static method called");
    }
}

interface SampleInterface {
    void performAction();
    String getName();
}

enum Status {
    ACTIVE,
    INACTIVE,
    PENDING
}

class InnerClass {
    public void innerMethod() {
        System.out.println("Inner method");
    }
}