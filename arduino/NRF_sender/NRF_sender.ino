//This is code for arduino module connected to RPi through i2c
//It's purpose is to get message and pass it along through NRF24l01+

//Communication protocol is like this:
//gets a string - 4 ints divided by , and ended with coma.
//It sennds 4 int array to other modules
//The module decides if it wants to respond.


#include <Wire.h>
#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"
#include "printf.h"

//
// Hardware configuration
//

// Set up nRF24L01 radio on SPI bus plus pins 9 & 10

RF24 radio(9,10);
// Radio pipe addresses for the 2 nodes to communicate.
const uint64_t pipes[2] = { 0xF0F0F0F0E1LL, 0xF0F0F0F0D2LL };
#define SLAVE_ADDRESS 0x04
#define DEBUG true
#define BUFFER 8
int toSend[BUFFER];
int response[BUFFER];
int index = 0;
boolean canSend = false;
boolean canRead = true;
boolean canRespond = false;


void setup(void)
{
  //Setup i2c
  
   // initialize i2c as slave
  Wire.begin(SLAVE_ADDRESS);
 
  // define callbacks for i2c communication
  Wire.onReceive(receiveData);
  Wire.onRequest(sendData);
  
  if(DEBUG) {
    Serial.begin(57600);
    printf_begin();
  }
  //
  // Setup and configure rf radio
  //

  radio.begin();
  radio.setRetries(15,15);
  radio.setPayloadSize(8);


  radio.openWritingPipe(pipes[0]);
  radio.openReadingPipe(1,pipes[1]);

  //
  // Start listening
  //

  radio.startListening();
  if(DEBUG) {
    radio.printDetails();
  }
}

 
// callback for received data
void receiveData(int byteCount){
 int piece;
 int response = 0;
 while(Wire.available() && canRead) {
  canSend = false;
  canRespond = false;
  piece = Wire.read(); 
  printf("[%i],", piece);
  if (piece==46) {
    //period
     if(DEBUG) {
       printf("I2C toSend: [%i][%i][%i][%i] \r\n", toSend[0],toSend[1],toSend[2],toSend[3]);
       //printf(" [%i][%i][%i] \r\n", toSend[4],toSend[5],toSend[6]);
     }
     canSend = true;
     canRead = false;
  } else if(piece==44) {
    //coma.
    if(DEBUG) {
      printf(" -> [%i] \r\n", toSend[index]);
    }
    index++;
    toSend[index] = 0;
  } else {
    piece = piece-48;
    toSend[index] = toSend[index]*10 + piece;
    if(DEBUG) {
      printf("+%i = %i", piece, toSend[index]);
    }
  }
  
 }

}
 
// callback for sending data
void sendData(){
  if(canRespond) {
   Wire.write((char* )response);
  }

}
 


int sendMsg() {
    //printf("Call with %s \r\n", msg);
    // First, stop listening so we can talk.
    radio.stopListening();

    // Take the time, and send it.  This will block until complete
    if(DEBUG) {
      printf("Now sending [%i][%i][%i][%i] ...", toSend[0],toSend[1],toSend[2],toSend[3]);
    }
    
    bool ok = radio.write( &toSend, sizeof(int[8]) );
    if(DEBUG) {
    if (ok)
      printf("ok...\n\r");
    else
      printf("failed.\n\r");
    }

    // Now, continue listening
    radio.startListening();

    // Wait here until we get a response, or timeout (250ms)
    unsigned long started_waiting_at = millis();
    bool timeout = false;
    while ( ! radio.available() && ! timeout )
      if (millis() - started_waiting_at > 500 )
        timeout = true;

    // Describe the results
    if ( timeout )
    {
      if(DEBUG) {
        printf("Failed, response timed out.\n\r");
      }
      return 0;
    }
    else
    {
      radio.read( &response, sizeof(response) );
      if(DEBUG) {
        printf("Response: [%i][%i][%i][%i][%i][%i][%i][%i].\n\r", response[0],response[1],response[2],response[3],response[4],response[5],response[6],response[7]);
      }
      return 1;
    }

}


void loop(void)
{
  int sending;
  int resp;
  if(canSend) {
    canSend = false;
    if(DEBUG) {
      printf("NRF Sending over NRF. \r\n");
    }
    resp = sendMsg();
    canRespond = true;
    
    if(DEBUG) {
      printf("NRF Response: \r\n", resp);
    }
    
    if(!canRead) {
      memset(toSend, 0, sizeof(toSend));  
      canRead = true;
      index = 0;
    }
  }
  
  delay(250);
  


}
