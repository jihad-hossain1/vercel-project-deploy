// Test script to simulate Vercel serverless function call
const handler = require('./api/index.js');

// Mock request and response objects
const mockReq = {
    method: 'GET',
    url: '/',
    headers: {
        'content-type': 'application/json'
    },
    body: {}
};

const mockRes = {
    statusCode: 200,
    headers: {},
    setHeader: function(name, value) {
        this.headers[name] = value;
    },
    status: function(code) {
        this.statusCode = code;
        return this;
    },
    json: function(data) {
        console.log('✅ Response Status:', this.statusCode);
        console.log('✅ Response Headers:', this.headers);
        console.log('✅ Response Data:', data);
        return this;
    },
    send: function(data) {
        console.log('✅ Response Status:', this.statusCode);
        console.log('✅ Response Headers:', this.headers);
        console.log('✅ Response Data:', data);
        return this;
    },
    end: function(data) {
        console.log('✅ Response Status:', this.statusCode);
        console.log('✅ Response Headers:', this.headers);
        if (data) console.log('✅ Response Data:', data);
        console.log('✅ Test completed successfully!');
    }
};

console.log('🚀 Testing serverless function...');

try {
    handler(mockReq, mockRes);
} catch (error) {
    console.error('❌ Error testing serverless function:', error.message);
    console.error(error.stack);
}