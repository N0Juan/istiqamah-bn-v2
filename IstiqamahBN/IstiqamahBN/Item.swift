//
//  Item.swift
//  IstiqamahBN
//
//  Created by Fauzan Salleh on 16/2/26.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
