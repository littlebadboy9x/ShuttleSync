package com.example.shuttlesync.dto;

public class AvailableCourtDTO {
    private int courtId;
    private String courtName;
    private String description;
    private String status;
    private int availableSlots;
    private double priceFrom;
    private double priceTo;
    private boolean isPopular;

    // Constructors
    public AvailableCourtDTO() {}

    public AvailableCourtDTO(int courtId, String courtName, String description, String status, 
                           int availableSlots, double priceFrom, double priceTo, boolean isPopular) {
        this.courtId = courtId;
        this.courtName = courtName;
        this.description = description;
        this.status = status;
        this.availableSlots = availableSlots;
        this.priceFrom = priceFrom;
        this.priceTo = priceTo;
        this.isPopular = isPopular;
    }

    // Getters and Setters
    public int getCourtId() {
        return courtId;
    }

    public void setCourtId(int courtId) {
        this.courtId = courtId;
    }

    public String getCourtName() {
        return courtName;
    }

    public void setCourtName(String courtName) {
        this.courtName = courtName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(int availableSlots) {
        this.availableSlots = availableSlots;
    }

    public double getPriceFrom() {
        return priceFrom;
    }

    public void setPriceFrom(double priceFrom) {
        this.priceFrom = priceFrom;
    }

    public double getPriceTo() {
        return priceTo;
    }

    public void setPriceTo(double priceTo) {
        this.priceTo = priceTo;
    }

    public boolean isPopular() {
        return isPopular;
    }

    public void setPopular(boolean popular) {
        isPopular = popular;
    }
} 